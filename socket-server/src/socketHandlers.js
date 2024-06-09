const redisClient = require("./redisClient");
const { REDIS_EXPIRATION } = require("./config");

/**
 * Maneja la conexión de un nuevo cliente Socket.IO.
 * @param {object} socket - El socket de conexión del cliente.
 * @param {object} io - La instancia del servidor Socket.IO.
 */
function handleConnection(socket, io) {
    console.log("Nuevo cliente conectado");

    socket.on("disconnect", () => {
        console.log("Cliente desconectado");

        redisClient.hdel("userSubscriptions", socket.id, (err) => {
            if (err) {
                console.error("Error al borrar la clave:", err);
            } else {
                console.log("Clave borrada:", socket.id);
            }
        });
    });

    socket.on("subscribeToPlaca", (placas) => {
        console.log(`Cliente ${socket.id} suscrito a la placa ${placas}`);

        redisClient.hset("userSubscriptions", socket.id, JSON.stringify(placas), (err) => {
            if (err) {
                console.error("Error al establecer la clave:", err);
            }
            /*else {
                redisClient.expire("userSubscriptions", REDIS_EXPIRATION);
            }*/
        });
    });

    socket.on("unsubscribeFromPlaca", () => {
        console.log(`Cliente ${socket.id} canceló la suscripción a una placa`);

        redisClient.hdel("userSubscriptions", socket.id, (err) => {
            if (err) {
                console.error("Error al borrar la clave:", err);
            } else {
                console.log("Clave borrada:", socket.id);
            }
        });
    });

    socket.on("newCoordinates", (coordinatesArray) => {
        console.log("Nuevas coordenadas recibidas");

        redisClient.hgetall("userSubscriptions", (err, subscriptions) => {
            if (err) {
                console.error("Error al obtener las suscripciones de los usuarios:", err);
                return;
            }

            console.log("newCoordinates", coordinatesArray);

            const receivedPlates = new Set(coordinatesArray.map((coordinate) => coordinate.placa));

            for (const socketId in subscriptions) {
                const placaString = subscriptions[socketId];
                const placas = JSON.parse(placaString);
                const intersection = placas.filter((placa) => receivedPlates.has(placa));

                if (intersection.length > 0) {
                    const coordinatesToSend = coordinatesArray.filter((coordinate) =>
                        intersection.includes(coordinate.placa)
                    );
                    io.to(socketId).emit("newCoordinates", coordinatesToSend);
                }
            }
        });
    });
}

module.exports = handleConnection;
