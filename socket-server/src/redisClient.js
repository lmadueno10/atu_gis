const redis = require("ioredis");
const { REDIS_URL } = require("./config");

/**
 * Cliente de Redis para manejar las conexiones.
 */
const redisClient = new redis(REDIS_URL);

module.exports = redisClient;
