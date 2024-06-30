const ioClient = require("socket.io-client");
const retry = require("retry");
const { SOCKET_SERVER_URL } = require("./config");

let socket;

function createSocket() {
    socket = ioClient(SOCKET_SERVER_URL, {
        path: "/socket-io",
    });

    socket.on("connect", () => {
        console.log("Conectado al servidor de sockets con ID:", socket.id);
    });

    socket.on("connect_error", (error) => {
        console.error("Error de conexión con el servidor de sockets:");
    });

    return socket;
}

function connectSocketWithRetry() {
    const operation = retry.operation({
        retries: 5,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 30000,
        randomize: true,
    });

    function attemptConnection(currentAttempt) {
        console.log(`Intento de conexión a Socket.IO: ${currentAttempt}`);
        socket = createSocket();

        socket.on("connect", () => {
            console.log("Conexión a Socket.IO establecida.");
            operation.stop();
        });

        socket.on("connect_error", (err) => {
            console.error("Error de conexión con el servidor de sockets:");
            if (operation.retry(err)) {
                console.error(`Intento de conexión a Socket.IO fallido: ${currentAttempt}`);
                return;
            }
            console.error("Failed to connect to Socket.IO after retries:");
        });
    }

    operation.attempt(attemptConnection);
}

connectSocketWithRetry();

module.exports = socket;
