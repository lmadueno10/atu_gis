const { poolSmc, poolTrx } = require("./pgPool");
const moment = require("moment-timezone");

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
    const clientSmc = await poolSmc.connect();
    const clientTrx = await poolTrx.connect();

    try {
        const insertTransmisionValues = [];
        const updatePlacaValues = [];
        const uniqueCoordinates = new Map();
        const currentTimestamp = moment().tz("America/Lima").format();

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
                currentTimestamp
            );
            uniqueCoordinates.set(coordinate.placa, coordinate);
        });

        const allUniqueCoordinates = Array.from(uniqueCoordinates.values());

        allUniqueCoordinates.forEach((coordinate) => {
            updatePlacaValues.push([
                coordinate.empresaId,
                coordinate.placa,
                coordinate.velocidad,
                coordinate.fechaHoraRegistroTrack,
                `SRID=4326;POINT(${coordinate.longitud} ${coordinate.latitud})`,
                currentTimestamp,
            ]);
        });

        const insertTransmisionQuery = `
        INSERT INTO transmisiones.transmision (fecha_hora, lat, lng, velocidad, altitud, orientacion, placa, empresa_id, geom, fecha_hora_insercion)
        VALUES ${generatePlaceholders(coordinatesArr.length, 10)}`;

        const updatePlacaQuery = `
        INSERT INTO gestion.placa (empresa_id, plate, speed, time_device, geom, time_reception)
        VALUES ${generatePlaceholders(allUniqueCoordinates.length, 6)}
        ON CONFLICT (plate) 
        DO UPDATE SET 
            empresa_id = EXCLUDED.empresa_id,
            speed = EXCLUDED.speed::DOUBLE PRECISION,
            time_reception = EXCLUDED.time_reception::TIMESTAMP,
            time_device = EXCLUDED.time_device::TIMESTAMP,
            geom = EXCLUDED.geom`;

        console.log("insertTransmisionQuery:", insertTransmisionQuery);
        console.log("insertTransmisionValues:", insertTransmisionValues);

        console.log("updatePlacaQuery:", updatePlacaQuery);
        console.log("updatePlacaValues:", updatePlacaValues.flat());

        await clientTrx.query("BEGIN");
        await clientTrx.query(insertTransmisionQuery, insertTransmisionValues);
        await clientTrx.query("COMMIT");

        await clientSmc.query("BEGIN");
        await clientSmc.query(updatePlacaQuery, updatePlacaValues.flat());
        await clientSmc.query("COMMIT");

        console.log("Datos insertados y actualizados en PostgreSQL.");
    } catch (error) {
        console.error("Error al insertar datos en PostgreSQL:", error);
        await clientTrx.query("ROLLBACK");
        await clientSmc.query("ROLLBACK");
    } finally {
        clientSmc.release();
        clientTrx.release();
    }
}

module.exports = insertIntoPostgres;
