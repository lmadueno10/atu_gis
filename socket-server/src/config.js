const os = require("os");

/**
 * Puerto en el que el servidor escuchará las conexiones.
 * @type {number}
 */
const PORT = process.env.PORT || 3003;

/**
 * URL de conexión para el servidor Redis.
 * @type {string}
 */
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Origen permitido para las conexiones CORS.
 * @type {string}
 */
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

/**
 * Tiempo de expiración para las claves de Redis (en segundos).
 * @type {number}
 */
const REDIS_EXPIRATION = parseInt(process.env.REDIS_EXPIRATION) || 86400;

/**
 * Ruta personalizada para Socket.IO.
 * @type {string}
 */
const CUSTOM_PATH = "/socket-io";

/**
 * Identificador único de la instancia del servidor.
 * @type {string}
 */
const INSTANCE_ID = `${os.hostname()}-${PORT}`;

module.exports = {
    PORT,
    REDIS_URL,
    CORS_ORIGIN,
    REDIS_EXPIRATION,
    CUSTOM_PATH,
    INSTANCE_ID,
};
