const http = require("http");
const socketIo = require("socket.io");
const redis = require("ioredis");

const PORT = process.env.PORT || 3051;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const REDIS_EXPIRATION = parseInt(process.env.REDIS_EXPIRATION) || 86400;
const CUSTOM_PATH = "/socket-io";

const server = http.createServer();

const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    path: CUSTOM_PATH,
});

const redisClient = redis.createClient(REDIS_URL);

io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado");

    socket.on("disconnect", () => {
        console.log("Cliente desconectado");

        redisClient.hdel("userSubscriptions", socket.id, (err, result) => {
            if (err) {
                console.error("Error al borrar la clave:", err);
                return;
            }
            console.log("Clave borrada:", socket.id);
        });
    });

    socket.on("subscribeToPlaca", (placas) => {
        console.log(`Cliente ${socket.id} suscrito a la placa ${placas}`);

        redisClient.hset("userSubscriptions", socket.id, JSON.stringify(placas), (err, result) => {
            if (err) {
                console.error("Error al establecer la clave:", err);
                return;
            }

            redisClient.expire("userSubscriptions", REDIS_EXPIRATION);
        });
    });

    socket.on("unsubscribeFromPlaca", () => {
        console.log(`Cliente ${socket.id} canceló la suscripción a una placa`);

        redisClient.hdel("userSubscriptions", socket.id, (err, result) => {
            if (err) {
                console.error("Error al borrar la clave:", err);
                return;
            }
            console.log("Clave borrada:", socket.id);
        });
    });

    socket.on("newCoordinates", (coordinates) => {
        console.log("Nuevas coordenadas recibidas");

        redisClient.hgetall("userSubscriptions", (err, subscriptions) => {
            if (err) {
                console.error("Error al obtener las suscripciones de los usuarios:", err);
                return;
            }

            console.log("newCoordinates", coordinates);

            for (const socketId in subscriptions) {
                const placaString = subscriptions[socketId];
                const placas = JSON.parse(placaString);

                if (placas.includes(coordinates.placa)) {
                    io.to(socketId).emit("newCoordinates", coordinates);
                }
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`Servidor de Socket.IO iniciado en el puerto ${PORT} con la ruta ${CUSTOM_PATH}`);
});
