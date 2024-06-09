const redis = require("redis");
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

module.exports = {
    redisClient,
    connectRedis,
};
