const os = require("os");

/**
 * Puerto en el que el servidor escuchará las conexiones.
 * @type {number}
 */
const PORT = process.env.PORT || 3001;

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

/**
 * Nombre de la clave de suscripciones de usuario en Redis.
 * @type {string}
 */
const REDIS_USER_SUBSCRIPTIONS = process.env.REDIS_USER_SUBSCRIPTIONS || "userSubscriptions";

/**
 * Nombre del campo utilizado para agrupar las coordenadas.
 * @type {string}
 */
const ENTITY_FIELD = process.env.ENTITY_FIELD || "placa";

/**
 * Nombre del campo utilizado para agrupar las coordenadas.
 * @type {string}
 */
const EVENT_NAME = (process.env.EVENT_NAME || "vehiclePosition").split(",");

module.exports = {
    PORT,
    REDIS_URL,
    CORS_ORIGIN,
    REDIS_EXPIRATION,
    CUSTOM_PATH,
    INSTANCE_ID,
    REDIS_USER_SUBSCRIPTIONS,
    ENTITY_FIELD,
    EVENT_NAME,
};
