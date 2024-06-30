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
        const updateInspectorValues = [];
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
                coordinate.codInspector,
                `SRID=4326;POINT(${coordinate.longitud} ${coordinate.latitud})`,
                currentTimestamp
            );
            uniqueCoordinates.set(coordinate.codInspector, coordinate);
        });

        uniqueCoordinates.forEach((coordinate) => {
            updateInspectorValues.push(
                coordinate.codInspector,
                coordinate.nombreInspector,
                coordinate.fechaHoraRegistroTrack,
                coordinate.latitud,
                coordinate.longitud,
                coordinate.velocidad,
                coordinate.altitud,
                coordinate.orientacion,
                `SRID=4326;POINT(${coordinate.longitud} ${coordinate.latitud})`,
                currentTimestamp
            );
        });

        const insertTransmisionQuery = `
        INSERT INTO transmisiones.transmision (fecha_hora, lat, lng, velocidad, altitud, orientacion, cod_inspector, geom, fecha_hora_insercion)
        VALUES ${generatePlaceholders(coordinatesArr.length, 9)}`;

        const updateInspectorQuery = `
        INSERT INTO gestion.inspectores (cod_inspector, nombre_inspector, fecha_hora, lat, lng, velocidad, altitud, orientacion, geom, fecha_hora_insercion)
        VALUES ${generatePlaceholders(uniqueCoordinates.size, 10)}
        ON CONFLICT (cod_inspector) DO UPDATE
        SET nombre_inspector = EXCLUDED.nombre_inspector,
            fecha_hora = EXCLUDED.fecha_hora,
            lat = EXCLUDED.lat,
            lng = EXCLUDED.lng,
            velocidad = EXCLUDED.velocidad,
            altitud = EXCLUDED.altitud,
            orientacion = EXCLUDED.orientacion,
            geom = EXCLUDED.geom,
            fecha_hora_insercion = EXCLUDED.fecha_hora_insercion`;

        await clientTrx.query("BEGIN");
        await clientTrx.query(insertTransmisionQuery, insertTransmisionValues);
        await clientTrx.query("COMMIT");

        await clientSmc.query("BEGIN");
        await clientSmc.query(updateInspectorQuery, updateInspectorValues.flat());
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
