const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const redis = require("ioredis");

const PORT = process.env.PORT || 3002;

const app = express();
app.use(cors());
app.use((req, res, next) => {
    console.log("Middleware de CORS aplicado");
    next();
});

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

const redisClient = redis.createClient();

redisClient.hgetall("userSubscriptions", (err, subscriptions) => {
    if (err) {
        console.error("Error al obtener las suscripciones de los usuarios:", err);
        return;
    }

    console.log("userSubscriptions:", subscriptions);
});

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
        //userSubscriptions[socket.id] = placas;

        redisClient.hset("userSubscriptions", socket.id, JSON.stringify(placas), (err, result) => {
            if (err) {
                console.error("Error al establecer la clave:", err);
                return;
            }

            redisClient.expire("userSubscriptions", 86400);
        });
    });

    socket.on("unsubscribeFromPlaca", () => {
        console.log(`Cliente ${socket.id} canceló la suscripción a una placa`);
        //delete userSubscriptions[socket.id];
        redisClient.hdel("userSubscriptions", socket.id, (err, result) => {
            if (err) {
                console.error("Error al borrar la clave:", err);
                return;
            }
            console.log("Clave borrada:", socket.id);
        });
    });

    socket.on("newCoordinates", (coordinates) => {
        //socket.broadcast.emit("newCoordinates", coordinates);

        redisClient.hgetall("userSubscriptions", (err, subscriptions) => {
            if (err) {
                console.error("Error al obtener las suscripciones de los usuarios:", err);
                return;
            }

            for (const socketId in subscriptions) {
                const placaString = subscriptions[socketId];
                const placas = JSON.parse(placaString);

                if (placas.includes(coordinates.placa)) {
                    io.to(socketId).emit("newCoordinates", coordinates);
                }
            }

            /*Object.values(subscriptions).forEach((subscription) => {
                const placas = JSON.parse(subscription);
                console.log("=>", subscription);
                if (placas.includes(coordinates.placa)) {
                    io.to(socket.id).emit("newCoordinates", coordinates);
                }
            });*/
        });

        /*Object.keys(userSubscriptions).forEach((clientId) => {
            const placas = userSubscriptions[clientId];

            if (placas.includes(coordinates.placa)) {
                console.log("Coordenadas recibidas:", coordinates);
                io.to(clientId).emit("newCoordinates", coordinates);
            }
        });*/
    });
});

server.listen(PORT, () => {
    console.log(`Servidor de Socket.IO iniciado en el puerto ${PORT}`);
});
