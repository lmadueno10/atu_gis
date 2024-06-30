const redis = require("redis");
const retry = require("retry");
const { REDIS_URL } = require("./config");

const redisClient = redis.createClient({ url: REDIS_URL });

redisClient.on("ready", () => {
    console.log("Conectado a Redis");
});

redisClient.on("error", (err) => {
    console.error("Error de conexión a Redis:", err);
});

async function connectRedis() {
    try {
        await redisClient.connect();
        console.log("Conexión a Redis establecida.");
    } catch (error) {
        console.error("Error al conectar a Redis:", error);
    }
}

function connectRedisWithRetry() {
    const operation = retry.operation({
        retries: 5,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 30000,
        randomize: true,
    });

    operation.attempt(async (currentAttempt) => {
        try {
            await connectRedis();
        } catch (err) {
            if (operation.retry(err)) {
                console.error(`Intento de conexión a Redis fallido: ${currentAttempt}`);
                return;
            }
            console.error("Failed to connect to Redis after retries:", err);
        }
    });
}

module.exports = {
    redisClient,
    connectRedis,
    connectRedisWithRetry,
};
