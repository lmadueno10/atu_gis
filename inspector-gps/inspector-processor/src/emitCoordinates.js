const { EVENT_NAME } = require("./config");
//const { redisClient } = require("./redisClient");
const socket = require("./socket");

async function emitCoordinatesToSubscribedUsers(coordinatesArr = []) {
    try {
        /*const subscriptions = await redisClient.hGetAll("userSubscriptions");
        const receivedInspectors = new Set(
            coordinatesArr.map((coordinate) => coordinate.codInspector)
        );

        const allSubscribedInspectors = new Set();

        for (const inspectorsString of Object.values(subscriptions)) {
            const inspectors = JSON.parse(inspectorsString);
            inspectors.forEach((inspector) => allSubscribedInspectors.add(inspector));
        }

        const inspectorsToSend = [...receivedInspectors].filter((inspector) =>
            allSubscribedInspectors.has(inspector)
        );

        const coordinatesToSend = coordinatesArr.filter((coordinate) =>
            inspectorsToSend.includes(coordinate.codInspector)
        );

        if (coordinatesToSend.length > 0) {
            console.log("coordinatesToSend", coordinatesToSend);
            socket.emit("newCoordinates", coordinatesToSend);
        }*/
        if (coordinatesArr.length > 0) {
            console.log("Send coordinates to " + EVENT_NAME, coordinatesArr);
            socket.emit(EVENT_NAME, coordinatesArr);
        }
    } catch (error) {
        console.error("Error al emitir coordenadas a usuarios suscritos:", error);
    }
}

module.exports = emitCoordinatesToSubscribedUsers;
