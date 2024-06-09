const express = require("express");
const amqp = require("amqplib");
const { PORT, AMQP_URL, QUEUE_NAME } = require("./src/config");
const insertIntoPostgres = require("./src/insertIntoPostgres");
const emitCoordinatesToSubscribedUsers = require("./src/emitCoordinates");
const { connectRedis } = require("./src/redisClient");

const app = express();
let amqpConnection;
let amqpChannel;
let server;

// Función para conectarse a RabbitMQ y manejar mensajes
async function connect() {
    try {
        amqpConnection = await amqp.connect(AMQP_URL);
        amqpChannel = await amqpConnection.createChannel();

        await amqpChannel.assertQueue(QUEUE_NAME, { durable: true });
        amqpChannel.prefetch(1);

        amqpChannel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                const coordinatesArr = JSON.parse(msg.content.toString());

                if (!Array.isArray(coordinatesArr)) {
                    console.error("El mensaje recibido no es un array.");
                    amqpChannel.ack(msg);
                    return;
                }

                console.log("Coordenadas recibidas:", coordinatesArr);
                await insertIntoPostgres(coordinatesArr);
                await emitCoordinatesToSubscribedUsers(coordinatesArr);
                amqpChannel.ack(msg);
            }
        });
    } catch (error) {
        console.error("Error al conectarse a RabbitMQ:", error);
    }
}

// Manejo de señal SIGINT para cierre ordenado
process.on("SIGINT", async () => {
    console.log("Desconectando...");

    if (amqpConnection) {
        await amqpConnection.close();
        console.log("Conexión AMQP cerrada.");
    }

    if (server) {
        server.close(() => {
            console.log("Servidor Express cerrado.");
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

// Inicia la conexión y el servidor
async function start() {
    await connectRedis();
    await connect();
}

start();

app.get("/", (_, res) => {
    res.send(`Coordinates processor OK!`);
});

server = app.listen(PORT, () => {
    console.log(`Coordinates-processor: Servidor API iniciado en el puerto ${PORT}`);
});
