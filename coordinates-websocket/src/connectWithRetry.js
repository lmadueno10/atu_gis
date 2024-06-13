const retry = require("retry");

module.exports = function connectWithRetry(pool) {
    const operation = retry.operation({
        retries: 5,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 30000,
        randomize: true,
    });

    operation.attempt((currentAttempt) => {
        pool.connect((err, client, release) => {
            if (operation.retry(err)) {
                console.error(`Intento de conexión fallido: ${currentAttempt}`);
                return;
            }

            if (err) {
                console.error("Failed to connect to PostgreSQL after retries:", err);
            } else {
                console.log("Connected to PostgreSQL with pool");
                release();
            }
        });
    });
};
