const express = require("express");
const { Client } = require("pg");
const amqp = require("amqplib");
const ioClient = require("socket.io-client");

const AMQP_URL = process.env.AMQP_URL || "amqp://localhost";
const PG_CONNECTION_STRING =
    process.env.PG_CONNECTION_STRING || "postgresql://atu_user:1a2a3b++@localhost:5432/testing";
const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || "http://localhost:3051";
const PORT = process.env.PORT || 3050;

let postgresClient;
let amqpConnection;
let amqpChannel;
let server;

const socket = ioClient(SOCKET_SERVER_URL, {
    path: "/socket-io",
});

socket.on("connect", () => {
    console.log("Conectado al servidor de sockets con ID:", socket.id);
});

socket.on("connect_error", (error) => {
    console.error("Error de conexión con el servidor de sockets:", error);
});

const app = express();

async function connect() {
    try {
        amqpConnection = await amqp.connect(AMQP_URL);
        amqpChannel = await amqpConnection.createChannel();
        const queueName = "transmission_queue";

        await amqpChannel.assertQueue(queueName, { durable: true });

        console.log("Esperando mensajes...");

        amqpChannel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const coordinates = JSON.parse(msg.content.toString());
                console.log("Coordenadas recibidas:", coordinates);
                await insertIntoPostgres(coordinates);
                socket.emit("newCoordinates", coordinates);
                amqpChannel.ack(msg);
            }
        });
    } catch (error) {
        console.error("Error al conectarse a RabbitMQ:", error);
    }
}

async function insertIntoPostgres(coordinates) {
    try {
        if (!postgresClient) {
            postgresClient = new Client({
                connectionString: PG_CONNECTION_STRING,
            });
            await postgresClient.connect();
        }

        const query = `
        INSERT INTO scm.transmision (fecha_hora, lat, lng, velocidad, altitud, orientacion, placa)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`;

        const values = [
            coordinates.fechaHoraRegistroTrack,
            coordinates.latitud,
            coordinates.longitud,
            coordinates.velocidad,
            coordinates.altitud,
            coordinates.orientacion,
            coordinates.placa,
        ];

        await postgresClient.query(query, values);

        const upsertVehiculosQuery = `
        INSERT INTO scm.vehiculos (placa, fecha_hora, lat, lng, velocidad, altitud, orientacion)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (placa) DO UPDATE 
        SET 
            fecha_hora = EXCLUDED.fecha_hora,
            lat = EXCLUDED.lat,
            lng = EXCLUDED.lng,
            velocidad = EXCLUDED.velocidad,
            altitud = EXCLUDED.altitud,
            orientacion = EXCLUDED.orientacion`;

        const upsertVehiculosValues = [
            coordinates.placa,
            coordinates.fechaHoraRegistroTrack,
            coordinates.latitud,
            coordinates.longitud,
            coordinates.velocidad,
            coordinates.altitud,
            coordinates.orientacion,
        ];

        await postgresClient.query(upsertVehiculosQuery, upsertVehiculosValues);

        console.log("Datos insertados en PostgreSQL.");
    } catch (error) {
        console.error("Error al insertar datos en PostgreSQL:", error);
    }
}

process.on("SIGINT", async () => {
    console.log("Desconectando...");

    if (amqpConnection) {
        await amqpConnection.close();
        console.log("Conexión AMQP cerrada.");
    }

    if (postgresClient) {
        await postgresClient.end();
        console.log("Conexión PostgreSQL cerrada.");
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

connect();

app.get("/", (req, res) => {
    res.send(`Coordinates processor OK!`);
});

server = app.listen(PORT, () => {
    console.log(`Coordinates-processor: Servidor API iniciado en el puerto ${PORT}`);
});
