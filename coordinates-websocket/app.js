const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const amqp = require("amqp-connection-manager");
const { Client } = require("pg");
require("dotenv").config();

const { PORT, AMQP_URL, PG_CONNECTION_STRING, INSTANCE_ID } = require("./src/config");

const verifyClient = require("./src/verifyClient");
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
    verifyClient: async (info, done) => verifyClient(info, done, pgClient),
});

wss.on("connection", (ws, req) => {
    console.log("Nuevo cliente conectado");
    ws.tokenValidation = req.tokenValidation;

    ws.on("message", async (message) => {
        console.log("Mensaje recibido:", message);
        await handleMessage(ws, message, ws.tokenValidation.empresaId, channelWrapper);
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
