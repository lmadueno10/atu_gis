const { Pool } = require("pg");
const config = require("./config");

const createPool = (database) => {
    return new Pool({
        user: config.PG_USER,
        host: config.PG_HOST,
        database: database,
        password: config.PG_PASSWORD,
        port: config.PG_PORT,
        max: config.PG_MAX,
        idleTimeoutMillis: config.PG_IDLE_TIMEOUT,
        connectionTimeoutMillis: config.PG_CONNECTION_TIMEOUT,
    });
};

const poolDBSmc = createPool(config.PG_DB_SMC);
const poolDBBuses = createPool(config.PG_DB_BUSES);
const poolDBTaxis = createPool(config.PG_DB_TAXIS);
const poolDBBicicletas = createPool(config.PG_DB_BICICLETAS);

module.exports = {
    poolDBSmc,
    poolDBBuses,
    poolDBTaxis,
    poolDBBicicletas,
};
