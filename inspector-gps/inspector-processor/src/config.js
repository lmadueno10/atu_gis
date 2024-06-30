const os = require("os");
require("dotenv").config();

/**
 * Puerto en el que el servidor escuchará las conexiones.
 * @type {number}
 */
const PORT = process.env.PORT || 3050;

/**
 * URL de conexión para el servidor AMQP (RabbitMQ).
 * @type {string}
 */
const AMQP_URL = process.env.AMQP_URL || "amqp://localhost";

/**
 * Nombre de la cola de mensajes.
 * @type {string}
 */
const QUEUE_NAME = process.env.QUEUE_NAME || "default_queue";

/**
 * Cadena de conexión para la base de datos PostgreSQL SMC.
 * @type {string}
 */
const PG_CONNECTION_STRING_SMC =
    process.env.PG_CONNECTION_STRING_SMC || "postgresql://atu_user:1a2a3b++@localhost:5432/testing";

/**
 * Cadena de conexión para la base de datos PostgreSQL TRX.
 * @type {string}
 */
const PG_CONNECTION_STRING_TRX =
    process.env.PG_CONNECTION_STRING_TRX || "postgresql://atu_user:1a2a3b++@localhost:5432/testing";

/**
 * URL del servidor de sockets.
 * @type {string}
 */
const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || "http://localhost:3000";

/**
 * URL de conexión para el servidor Redis.
 * @type {string}
 */
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Identificador único de la instancia del servidor.
 * @type {string}
 */
const INSTANCE_ID = `${os.hostname()}-${PORT}`;

/**
 * Nombre del campo utilizado para agrupar las coordenadas.
 * @type {string}
 */
const EVENT_NAME = process.env.EVENT_NAME || "inspectorPosition";

module.exports = {
    PORT,
    AMQP_URL,
    QUEUE_NAME,
    PG_CONNECTION_STRING_SMC,
    PG_CONNECTION_STRING_TRX,
    SOCKET_SERVER_URL,
    REDIS_URL,
    INSTANCE_ID,
    EVENT_NAME,
};
