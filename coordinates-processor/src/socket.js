const ioClient = require("socket.io-client");
const { SOCKET_SERVER_URL } = require("./config");

const socket = ioClient(SOCKET_SERVER_URL, {
    path: "/socket-io",
});

socket.on("connect", () => {
    console.log("Conectado al servidor de sockets con ID:", socket.id);
});

socket.on("connect_error", (error) => {
    console.error("Error de conexión con el servidor de sockets:", error);
});

module.exports = socket;
