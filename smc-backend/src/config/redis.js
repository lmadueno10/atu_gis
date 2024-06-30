const { createClient } = require("redis");
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = require("./config");

const client = createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    password: REDIS_PASSWORD !== "null" ? REDIS_PASSWORD : undefined,
});

client.on("error", (err) => {
    console.error("Redis Client Error", err);
});

const connectClient = async () => {
    if (!client.isOpen) {
        await client.connect();
    }
    console.log("Connected to Redis");
};

connectClient();

const getAsync = async (key) => {
    if (!client.isReady) {
        await connectClient();
    }
    return await client.get(key);
};

const setAsync = async (key, value) => {
    if (!client.isReady) {
        await connectClient();
    }
    return await client.set(key, value);
};

module.exports = {
    client,
    getAsync,
    setAsync,
};
