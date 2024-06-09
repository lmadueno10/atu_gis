const http = require("http");
const socketIo = require("socket.io");
const { PORT, CORS_ORIGIN, CUSTOM_PATH } = require("./src/config");
const handleConnection = require("./src/socketHandlers");

/**
 * Servidor HTTP para manejar las conexiones Socket.IO.
 */
const server = http.createServer();

/**
 * Instancia de Socket.IO con configuración de CORS y ruta personalizada.
 */
const io = socketIo(server, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ["GET", "POST"],
    },
    path: CUSTOM_PATH,
});

io.on("connection", (socket) => handleConnection(socket, io));

server.listen(PORT, () => {
    console.log(`Servidor de Socket.IO iniciado en el puerto ${PORT} con la ruta ${CUSTOM_PATH}`);
});
