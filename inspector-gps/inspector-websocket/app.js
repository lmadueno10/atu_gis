const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const amqp = require("amqp-connection-manager");
require("dotenv").config();

const { PORT, AMQP_URL, INSTANCE_ID } = require("./src/config");

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

const wss = new WebSocket.Server({
    server,
    clientTracking: false,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3,
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024,
        },
        clientNoContextTakeover: false,
        serverNoContextTakeover: false,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024,
    },
    verifyClient: async (info, done) => verifyClient(info, done),
});

wss.on("connection", (ws, req) => {
    //console.log("Nuevo cliente conectado");
    ws.tokenValidation = req.tokenValidation;

    ws.on("message", async (message) => {
        try {
            await handleMessage(ws, message, ws.tokenValidation.empresaId, channelWrapper);
        } catch (err) {
            console.error("Error handling message:", err);
            ws.send(JSON.stringify({ error: "Error handling message" }));
        }
    });

    ws.on("ping", () => {
        console.log("Received ping, sending pong");
        ws.pong();
    });

    ws.on("pong", () => {
        console.log("Received pong");
    });

    ws.on("close", (code, reason) => {
        //console.log(`Cliente desconectado: Código ${code}, Razón ${reason}`);
    });

    ws.on("error", (err) => {
        console.error("WebSocket error:", err);
    });

    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
        }
    }, 30000);

    ws.on("close", () => {
        clearInterval(pingInterval);
    });
});

app.get("/", (_, res) => {
    res.send(`Inspector Coordinates API OK!, instancia ${INSTANCE_ID}`);
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
