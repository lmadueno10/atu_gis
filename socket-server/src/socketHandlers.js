const { REDIS_USER_SUBSCRIPTIONS, EVENT_NAME } = require("./config");
const redisClient = require("./redisClient");
/**
 * Maneja la conexión de un nuevo cliente Socket.IO.
 * @param {object} socket - El socket de conexión del cliente.
 * @param {object} io - La instancia del servidor Socket.IO.
 */
function handleConnection(socket, io) {
    console.log("Nuevo cliente conectado");

    socket.on("disconnect", () => {
        console.log("Cliente desconectado");

        redisClient.hdel(REDIS_USER_SUBSCRIPTIONS, socket.id, (err) => {
            if (err) {
                console.error("Error al borrar la clave:", err);
            } else {
                console.log("Clave borrada:", socket.id);
            }
        });
    });

    socket.on("subscribeToEntities", (entities = []) => {
        console.log(`Cliente ${socket.id} suscrito a las entidades: ${entities.join(", ")}`);

        redisClient.hset(REDIS_USER_SUBSCRIPTIONS, socket.id, JSON.stringify(entities), (err) => {
            if (err) {
                console.error("Error al establecer la clave:", err);
            }
        });
    });

    socket.on("unsubscribeFromEntities", () => {
        console.log(`Cliente ${socket.id} canceló la suscripción a las entidades`);

        redisClient.hdel(REDIS_USER_SUBSCRIPTIONS, socket.id, (err) => {
            if (err) {
                console.error("Error al borrar la clave:", err);
            } else {
                console.log("Clave borrada:", socket.id);
            }
        });
    });

    const eventNames = EVENT_NAME;

    console.log("eventNames", eventNames);

    eventNames.forEach((eventName) => {
        console.log("eventName", eventName);

        socket.on(eventName, (data = []) => {
            console.log(`Evento recibido: ${eventName}`);
            console.log(data);
            socket.broadcast.emit(eventName, data);
        });
    });

    /*socket.on(EVENT_NAME, (data = []) => {
        console.log(`Evento recibido: ${EVENT_NAME}`);
        console.log(data);
        socket.broadcast.emit(EVENT_NAME, data);
    });*/

    /*socket.on(EVENT_NAME, (coordinatesArr = []) => {
        console.log("Nuevas coordenadas recibidas", EVENT_NAME, coordinatesArr);
        socket.broadcast.emit(EVENT_NAME, coordinatesArr);

        redisClient.hgetall(REDIS_USER_SUBSCRIPTIONS, (err, subscriptions) => {
            if (err) {
                console.error("Error al obtener las suscripciones de los usuarios:", err);
                return;
            }

            console.log("newCoordinates", coordinatesArray);

            const receivedEntities = new Set(
                coordinatesArray.map((coordinate) => coordinate[ENTITY_FIELD])
            );

            for (const socketId in subscriptions) {
                const entitiesString = subscriptions[socketId];
                const entities = JSON.parse(entitiesString);
                const intersection = entities.filter((entity) => receivedEntities.has(entity));

                if (intersection.length > 0) {
                    const coordinatesToSend = coordinatesArray.filter((coordinate) =>
                        intersection.includes(coordinate[ENTITY_FIELD])
                    );
                    io.to(socketId).emit("newCoordinates", coordinatesToSend);
                }
            }
        });
    });*/
}

module.exports = handleConnection;
