const { Client } = require("pg");
const { PG_CONNECTION_STRING_SMC, PG_CONNECTION_STRING_TRX, INSTANCE_ID } = require("./config");

let postgresClientSmc;
let postgresClientTrx;

function generatePlaceholders(count, valuesPerRow) {
    const placeholders = [];
    for (let i = 0; i < count; i++) {
        const row = [];
        for (let j = 0; j < valuesPerRow; j++) {
            row.push(`$${i * valuesPerRow + j + 1}`);
        }
        placeholders.push(`(${row.join(", ")})`);
    }
    return placeholders.join(", ");
}

async function insertIntoPostgres(coordinatesArr) {
    try {
        if (!postgresClientSmc) {
            postgresClientSmc = new Client({ connectionString: PG_CONNECTION_STRING_SMC });
            await postgresClientSmc.connect();
        }

        if (!postgresClientTrx) {
            postgresClientTrx = new Client({ connectionString: PG_CONNECTION_STRING_TRX });
            await postgresClientTrx.connect();
        }

        const insertTransmisionValues = [];
        const updatePlacaValues = [];
        const uniqueCoordinates = new Map();

        coordinatesArr.forEach((coordinate) => {
            insertTransmisionValues.push(
                coordinate.fechaHoraRegistroTrack,
                coordinate.latitud,
                coordinate.longitud,
                coordinate.velocidad,
                coordinate.altitud,
                coordinate.orientacion,
                coordinate.placa,
                coordinate.empresaId,
                `SRID=4326;POINT(${coordinate.longitud} ${coordinate.latitud})`,
                INSTANCE_ID
            );
            uniqueCoordinates.set(coordinate.placa, coordinate);
        });

        uniqueCoordinates.forEach((coordinate) => {
            updatePlacaValues.push([
                coordinate.placa,
                coordinate.velocidad,
                coordinate.fechaHoraRegistroTrack,
                `SRID=4326;POINT(${coordinate.longitud} ${coordinate.latitud})`,
            ]);
        });

        const insertTransmisionQuery = `
        INSERT INTO transmisiones.transmision (fecha_hora, lat, lng, velocidad, altitud, orientacion, placa, empresa_id, geom, instance_id)
        VALUES ${generatePlaceholders(coordinatesArr.length, 10)}`;

        const updatePlacaQuery = `
        UPDATE gestion.placa AS p
        SET 
            speed = u.velocidad::DOUBLE PRECISION,
            time_reception = NOW(),
            time_device = u.time_device::TIMESTAMP,
            geom = u.geom
        FROM (
            VALUES ${generatePlaceholders(uniqueCoordinates.size, 4)}
        ) AS u(plate, velocidad, time_device, geom)
        WHERE 
            p.plate = u.plate`;

        await postgresClientTrx.query("BEGIN");
        await postgresClientTrx.query(insertTransmisionQuery, insertTransmisionValues);
        await postgresClientTrx.query("COMMIT");

        await postgresClientSmc.query("BEGIN");
        await postgresClientSmc.query(updatePlacaQuery, updatePlacaValues.flat());
        await postgresClientSmc.query("COMMIT");

        console.log("Datos insertados y actualizados en PostgreSQL.");
    } catch (error) {
        console.error("Error al insertar datos en PostgreSQL:", error);
        await postgresClientTrx.query("ROLLBACK");
        await postgresClientSmc.query("ROLLBACK");
    }
}

module.exports = insertIntoPostgres;
