require("dotenv").config();

/**
 * Puerto en el que el servidor escuchará las conexiones.
 * @type {number}
 */
const PORT = process.env.PORT || 3001;

/**
 * Credenciales y configuración para PostgreSQL.
 */
const PG_USER = process.env.PG_USER;
const PG_PASSWORD = process.env.PG_PASSWORD;
const PG_HOST = process.env.PG_HOST;
const PG_PORT = parseInt(process.env.PG_PORT, 10) || 5432;

/**
 * Configuración del pool de conexiones para PostgreSQL.
 * @type {number}
 */
const PG_MAX = parseInt(process.env.PG_MAX, 10) || 5;
const PG_IDLE_TIMEOUT = parseInt(process.env.PG_IDLE_TIMEOUT, 10) || 30000;
const PG_CONNECTION_TIMEOUT = parseInt(process.env.PG_CONNECTION_TIMEOUT, 10) || 2000;

/**
 * Nombres de las bases de datos.
 */
const PG_DB_SMC = process.env.PG_DB_SMC;
const PG_DB_BUSES = process.env.PG_DB_BUSES;
const PG_DB_TAXIS = process.env.PG_DB_TAXIS;
const PG_DB_BICICLETAS = process.env.PG_DB_BICICLETAS;

/**
 * Configuración de Redis.
 */
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT, 10) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || null;

/**
 * Limite máximo de transmisiones.
 * @type {number}
 */
const MAX_TRANSMISIONES_LIMIT = parseInt(process.env.MAX_TRANSMISIONES_LIMIT, 10) || 1000;

/**
 * URL del servidor de sockets.
 * @type {string}
 */
const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || "http://localhost:3000";

module.exports = {
    PORT,
    PG_USER,
    PG_PASSWORD,
    PG_HOST,
    PG_PORT,
    PG_MAX,
    PG_IDLE_TIMEOUT,
    PG_CONNECTION_TIMEOUT,
    PG_DB_SMC,
    PG_DB_BUSES,
    PG_DB_TAXIS,
    PG_DB_BICICLETAS,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_PASSWORD,
    MAX_TRANSMISIONES_LIMIT,
    SOCKET_SERVER_URL,
};
