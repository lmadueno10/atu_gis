const os = require("os");

/**
 * Puerto en el que el servidor escuchará las conexiones.
 * @type {number}
 */
const PORT = process.env.PORT || 3001;

/**
 * URL de conexión para el servidor AMQP (RabbitMQ).
 * @type {string}
 */
const AMQP_URL = process.env.AMQP_URL || "amqp://localhost";

/**
 * Cadena de conexión para la base de datos PostgreSQL.
 * @type {string}
 */
const PG_CONNECTION_STRING =
    process.env.PG_CONNECTION_STRING || "postgresql://atu_user:1a2a3b++@localhost:5432/testing";

/**
 * Identificador único de la instancia del servidor.
 * @type {string}
 */
const INSTANCE_ID = `${os.hostname()}-${PORT}`;

/**
 * Código de éxito para las operaciones.
 * @type {number}
 */
const SUCCESS_CODE = 1;

/**
 * Códigos de error utilizados en la aplicación.
 * @type {object}
 */
const ERROR_CODES = {
    TOKEN_MISSING: { code: 15, message: "Token no proporcionado en la URL" },
    TOKEN_INVALID: { code: 16, message: "Token inválido o no autorizado" },
    DATA_MISSING: { code: 14, message: "No se recibieron datos de coordenadas" },
    JSON_SYNTAX: { code: 3, message: "Verificar JSON enviado" },
    PROCESS_ERROR: { code: 13, message: "Error al procesar el mensaje" },
};

module.exports = {
    PORT,
    AMQP_URL,
    PG_CONNECTION_STRING,
    INSTANCE_ID,
    SUCCESS_CODE,
    ERROR_CODES,
};
