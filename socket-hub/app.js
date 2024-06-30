const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    path: "/socket-hubv1",
});

/* 
Define una ruta de prueba para verificar que el servidor está funcionando 
Cuando se accede a /ping, el servidor responde con "pong".
*/
app.get("/ping", (_, res) => {
    res.send("pong");
});

/* 
Maneja las conexiones de clientes a través de Socket.IO 
Cada vez que un cliente se conecta, se ejecuta esta función de devolución de llamada.
*/
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    const messageChannel = process.env.PORT || "message";

    socket.on(messageChannel, (data) => {
        console.log("Message received:", data);
        io.emit(messageChannel, data);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
