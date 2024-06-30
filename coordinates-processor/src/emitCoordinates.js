//const { redisClient } = require("./redisClient");
const { EVENT_NAME } = require("./config");
const socket = require("./socket");

async function emitCoordinatesToSubscribedUsers(coordinatesArr = []) {
    try {
        // Subscriptions
        /*const subscriptions = await redisClient.hGetAll("userSubscriptions");
        const receivedPlates = new Set(coordinatesArr.map((coordinate) => coordinate.placa));

        const allSubscribedPlates = new Set();

        for (const placasString of Object.values(subscriptions)) {
            const placas = JSON.parse(placasString);
            placas.forEach((placa) => allSubscribedPlates.add(placa));
        }

        const platesToSend = [...receivedPlates].filter((placa) => allSubscribedPlates.has(placa));

        const coordinatesToSend = coordinatesArr.filter((coordinate) =>
            platesToSend.includes(coordinate.placa)
        );

        if (coordinatesToSend.length > 0) {
            console.log("coordinatesToSend", coordinatesToSend);
            socket.emit("newCoordinates", coordinatesToSend);
        }*/

        if (coordinatesArr.length > 0) {
            console.log("coordinatesToSend to event " + EVENT_NAME, coordinatesArr);
            socket.emit(EVENT_NAME, coordinatesArr);
        }
    } catch (error) {
        console.error("Error al emitir coordenadas a usuarios suscritos:", error);
    }
}

module.exports = emitCoordinatesToSubscribedUsers;
