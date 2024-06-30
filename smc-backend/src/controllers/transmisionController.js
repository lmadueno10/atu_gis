const format = require("pg-format");
const { validateAndFormatDate } = require("../utils/dateUtils");
const { MAX_TRANSMISIONES_LIMIT } = require("../config/config");

const getTransmisiones = (pool) => async (req, res) => {
    const { placa, limit = 10, page = 1, fecha_inicio, fecha_fin } = req.query;

    const formattedFechaInicio = fecha_inicio ? validateAndFormatDate(fecha_inicio) : null;
    const formattedFechaFin = fecha_fin ? validateAndFormatDate(fecha_fin) : null;

    if ((fecha_inicio && !formattedFechaInicio) || (fecha_fin && !formattedFechaFin)) {
        return res
            .status(400)
            .json({ error: "Formato de fecha inválido. Utilice DD/MM/YYYY o DD/MM/YYYY HH:mm" });
    }

    const adjustedLimit = Math.min(parseInt(limit, 10), MAX_TRANSMISIONES_LIMIT);
    const offset = (page - 1) * adjustedLimit;

    try {
        let query = `
        SELECT 
            TO_CHAR(fecha_hora, 'DD/MM/YYYY HH24:MI:SS') as fecha_hora, 
            lat, 
            lng, 
            velocidad, 
            altitud, 
            orientacion, 
            placa, 
            TO_CHAR(fecha_hora_insercion, 'DD/MM/YYYY HH24:MI:SS') as fecha_hora_insercion 
        FROM transmisiones.transmision`;

        const queryParams = [];

        if (placa) {
            query += " WHERE placa = %L";
            queryParams.push(placa);
        }

        if (formattedFechaInicio) {
            if (queryParams.length > 0) {
                query += " AND";
            } else {
                query += " WHERE";
            }
            query += " fecha_hora >= %L";
            queryParams.push(formattedFechaInicio);
        }

        if (formattedFechaFin) {
            if (queryParams.length > 0) {
                query += " AND";
            } else {
                query += " WHERE";
            }
            query += " fecha_hora <= %L";
            queryParams.push(formattedFechaFin);
        }

        query += " ORDER BY fecha_hora DESC LIMIT %s OFFSET %s";
        queryParams.push(adjustedLimit);
        queryParams.push(offset);

        const formattedQuery = format(query, ...queryParams);
        const result = await pool.query(formattedQuery);

        res.json({
            pagination: {
                currentPage: page,
                limit: adjustedLimit,
                totalRecords: result.rowCount,
            },
            data: result.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    getTransmisiones,
};
