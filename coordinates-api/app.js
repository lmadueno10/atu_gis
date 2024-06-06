const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const amqp = require("amqp-connection-manager");
const os = require("os");
const { Client } = require("pg");
require("dotenv").config();

const { PORT, AMQP_URL, PG_CONNECTION_STRING, INSTANCE_ID } = require("./src/config");
const validateToken = require("./src/validateToken");
const handleMessage = require("./src/handleMessage");

const app = express();
const server = http.createServer(app);

const connection = amqp.connect([AMQP_URL], {
    heartbeatIntervalInSeconds: 6000,
});

const channelWrapper = connection.createChannel({
    json: true,
});

const pgClient = new Client({
    connectionString: PG_CONNECTION_STRING,
});
pgClient.connect();

const wss = new WebSocket.Server({
    server,
    clientTracking: true,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3,
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024,
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024,
    },
    verifyClient: (info, done) => {
        done(true);
    },
});

wss.on("connection", (ws, req) => {
    console.log("Nuevo cliente conectado");

    ws.on("message", async (message) => {
        const params = new URLSearchParams(req.url.split("?")[1]);
        const token = params.get("token");

        if (!token) {
            return ws.send(
                JSON.stringify({
                    codResultado: 15,
                    desResultado: "Token no proporcionado en la URL",
                })
            );
        }

        const tokenValidation = await validateToken(pgClient, token);
        if (!tokenValidation.isValid) {
            return ws.send(
                JSON.stringify({
                    codResultado: 16,
                    desResultado: "Token inválido o no autorizado",
                })
            );
        }

        console.log("Mensaje recibido:", message);
        await handleMessage(ws, message, tokenValidation.empresaId, channelWrapper);
    });

    ws.on("close", () => {
        console.log("Cliente desconectado");
    });
});

app.get("/", (req, res) => {
    res.send(`Coordinates API OK!, instancia ${INSTANCE_ID}`);
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
