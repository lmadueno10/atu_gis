const retry = require("retry");

module.exports = function connectWithRetry(pool) {
    const operation = retry.operation({
        retries: 5,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 30000,
        randomize: true,
    });

    operation.attempt(async (currentAttempt) => {
        try {
            const client = await pool.connect();
            console.log("Connected to PostgreSQL with pool");
            client.release();
        } catch (err) {
            if (operation.retry(err)) {
                console.error(`Intento de conexión fallido: ${currentAttempt}`);
                return;
            }
            console.error("Failed to connect to PostgreSQL after retries:", err);
        }
    });
};
