const { Client } = require("pg");
const amqp = require("amqplib");
const ioClient = require("socket.io-client");

const AMQP_URL = process.env.AMQP_URL || "amqp://localhost";
const PG_CONNECTION_STRING =
    process.env.PG_CONNECTION_STRING || "postgresql://atu_user:1a2a3b++@localhost:5432/testing";
const SOCKET_SERVER_URL = "http://localhost:3002";

let postgresClient;
const socket = ioClient(SOCKET_SERVER_URL);

async function connect() {
    try {
        const connection = await amqp.connect(AMQP_URL);
        const channel = await connection.createChannel();
        const queueName = "transmission_queue";

        await channel.assertQueue(queueName, { durable: true });

        console.log("Esperando mensajes...");

        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                const coordinates = JSON.parse(msg.content.toString());
                console.log("Coordenadas recibidas:", coordinates);
                await insertIntoPostgres(coordinates);
                socket.emit("newCoordinates", coordinates);
                channel.ack(msg);
            }
        });

        process.on("SIGINT", () => {
            console.log("Desconectando...");
            connection.close();
            if (postgresClient) {
                postgresClient.end();
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
        INSERT INTO scm.transmision (fecha_hora, lat, lng, velocidad, precision, bearing, placa)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`;

        const values = [
            coordinates.fecha_hora,
            coordinates.lat,
            coordinates.lng,
            coordinates.velocidad,
            coordinates.precision,
            coordinates.bearing,
            coordinates.placa,
        ];

        await postgresClient.query(query, values);
        console.log("Datos insertados en PostgreSQL.");
    } catch (error) {
        console.error("Error al insertar datos en PostgreSQL:", error);
    }
}

connect();
