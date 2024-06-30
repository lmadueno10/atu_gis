const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const { PORT, CORS_ORIGIN, CUSTOM_PATH } = require("./src/config");
const handleConnection = require("./src/socketHandlers");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ["GET", "POST"],
    },
    path: CUSTOM_PATH,
});

/**
 * Healthcheck
 */
app.get("/ping", (_, res) => {
    res.send("pong");
});

io.on("connection", (socket) => handleConnection(socket, io));

server.listen(PORT, () => {
    console.log(`Servidor de Socket.IO iniciado en el puerto ${PORT} con la ruta ${CUSTOM_PATH}`);
});
