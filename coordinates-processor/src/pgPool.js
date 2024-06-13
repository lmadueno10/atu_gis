const { Pool } = require("pg");
const { PG_CONNECTION_STRING_SMC, PG_CONNECTION_STRING_TRX } = require("./config");

const poolSmc = new Pool({
    connectionString: PG_CONNECTION_STRING_SMC,
    max: 50,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

const poolTrx = new Pool({
    connectionString: PG_CONNECTION_STRING_TRX,
    max: 50,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

poolSmc.on("connect", () => {
    console.log("Connected to PostgreSQL SMC");
});

poolSmc.on("error", (err) => {
    console.error("Error in PostgreSQL pool SMC", err);
});

poolTrx.on("connect", () => {
    console.log("Connected to PostgreSQL TRX");
});

poolTrx.on("error", (err) => {
    console.error("Error in PostgreSQL pool TRX", err);
});

module.exports = { poolSmc, poolTrx };
