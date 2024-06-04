const express = require("express");
const { Client } = require("pg");
const amqp = require("amqplib");
const os = require("os");

require("dotenv").config();

const AMQP_URL = process.env.AMQP_URL || "amqp://localhost";
const PG_CONNECTION_STRING =
    process.env.PG_CONNECTION_STRING || "postgresql://atu_user:1a2a3b++@localhost:5432/testing";
const PORT = process.env.PORT || 3050;
const INSTANCE_ID = `${os.hostname()}-${PORT}`;

let postgresClient;
let amqpConnection;
let amqpChannel;
let server;

const app = express();

async function connect() {
    try {
        amqpConnection = await amqp.connect(AMQP_URL);
        amqpChannel = await amqpConnection.createChannel();
        const queueName = "transmission_queue";

        await amqpChannel.assertQueue(queueName, { durable: true });
        amqpChannel.prefetch(1);

        console.log("Esperando mensajes...");

        amqpChannel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const coordinatesArr = JSON.parse(msg.content.toString());

                if (!Array.isArray(coordinatesArr)) {
                    console.error("El mensaje recibido no es un array.");
                    amqpChannel.ack(msg);
                    return;
                }

                console.log("Coordenadas recibidas:", coordinatesArr);
                await insertIntoPostgres(coordinatesArr);
                amqpChannel.ack(msg);
            }
        });
    } catch (error) {
        console.error("Error al conectarse a RabbitMQ:", error);
    }
}

function generatePlaceholders(count, valuesPerRow) {
    const placeholders = [];
    for (let i = 0; i < count; i++) {
        const row = [];
        for (let j = 0; j < valuesPerRow; j++) {
            row.push(`$${i * valuesPerRow + j + 1}`);
        }
        placeholders.push(`(${row.join(", ")})`);
    }
    return placeholders.join(", ");
}

async function insertIntoPostgres(coordinatesArr) {
    try {
        if (!postgresClient) {
            postgresClient = new Client({
                connectionString: PG_CONNECTION_STRING,
            });
            await postgresClient.connect();
        }

        const insertTransmisionValues = [];
        const upsertVehiculosValues = [];

        const uniqueCoordinates = new Map();

        coordinatesArr.forEach((coordinate) => {
            insertTransmisionValues.push(
                coordinate.fechaHoraRegistroTrack,
                coordinate.latitud,
                coordinate.longitud,
                coordinate.velocidad,
                coordinate.altitud,
                coordinate.orientacion,
                coordinate.placa,
                INSTANCE_ID
            );

            uniqueCoordinates.set(coordinate.placa, coordinate);
        });

        uniqueCoordinates.forEach((coordinate) => {
            upsertVehiculosValues.push(
                coordinate.placa,
                coordinate.fechaHoraRegistroTrack,
                coordinate.latitud,
                coordinate.longitud,
                coordinate.velocidad,
                coordinate.altitud,
                coordinate.orientacion
            );
        });

        const insertTransmisionQuery = `
        INSERT INTO scm.transmision (fecha_hora, lat, lng, velocidad, altitud, orientacion, placa, instance_id)
        VALUES ${generatePlaceholders(coordinatesArr.length, 8)}`;

        const upsertVehiculosQuery = `
        INSERT INTO scm.vehiculos (placa, fecha_hora, lat, lng, velocidad, altitud, orientacion)
        VALUES ${generatePlaceholders(uniqueCoordinates.size, 7)}
        ON CONFLICT (placa) DO UPDATE 
        SET 
            fecha_hora = EXCLUDED.fecha_hora,
            lat = EXCLUDED.lat,
            lng = EXCLUDED.lng,
            velocidad = EXCLUDED.velocidad,
            altitud = EXCLUDED.altitud,
            orientacion = EXCLUDED.orientacion`;

        await postgresClient.query(insertTransmisionQuery, insertTransmisionValues);
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
