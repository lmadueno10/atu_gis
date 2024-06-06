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
        const updatePlacaValues = [];

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
                coordinate.empresaId,
                `SRID=4326;POINT(${coordinate.longitud} ${coordinate.latitud})`,
                INSTANCE_ID
            );

            uniqueCoordinates.set(coordinate.placa, coordinate);
        });

        uniqueCoordinates.forEach((coordinate) => {
            updatePlacaValues.push([
                coordinate.placa,
                coordinate.velocidad,
                coordinate.fechaHoraRegistroTrack,
                `SRID=4326;POINT(${coordinate.longitud} ${coordinate.latitud})`,
            ]);
        });

        const insertTransmisionQuery = `
        INSERT INTO transmisiones.transmision (fecha_hora, lat, lng, velocidad, altitud, orientacion, placa, empresa_id, geom, instance_id)
        VALUES ${generatePlaceholders(coordinatesArr.length, 10)}`;

        const updatePlacaQuery = `
        UPDATE gestion.placa AS p
        SET 
            speed = u.velocidad::DOUBLE PRECISION,
            time_reception = NOW(),
            time_device = u.time_device::TIMESTAMP,
            geom = u.geom
        FROM (
            VALUES ${generatePlaceholders(uniqueCoordinates.size, 4)}
        ) AS u(plate, velocidad, time_device, geom)
        WHERE p.plate = u.plate`;

        await postgresClient.query("BEGIN");
        await postgresClient.query(insertTransmisionQuery, insertTransmisionValues);
        await postgresClient.query(updatePlacaQuery, updatePlacaValues.flat());
        await postgresClient.query("COMMIT");

        console.log("Datos insertados y actualizados en PostgreSQL.");
    } catch (error) {
        console.error("Error al insertar datos en PostgreSQL:", error);
        await postgresClient.query("ROLLBACK");
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
