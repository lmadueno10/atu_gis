const express = require("express");
const Ajv = require("ajv");
const socket = require("../config/socketClient");
const { poolDBSmc } = require("../config/db");
const documentoControlSchema = require("../schemas/DocumentoControlSchema");
const router = express.Router();

const ajv = new Ajv();
const validate = ajv.compile(documentoControlSchema);

router.post("/notificar-registro-acta", async (req, res) => {
    const data = req.body;

    const valid = validate(data);
    if (!valid) {
        console.error("Invalid data:", validate.errors);
        return res.status(400).json({ errors: validate.errors });
    }

    try {
        const actaParsed = [
            {
                ...data,
                codInspector: data.user,
            },
        ];

        const query = `
        INSERT INTO gestion.inspector_acta (
            latitude, longitude, imei, user_id, user_name, cell_number,
            proceeding_type_id, proceeding_type, color, proceeding_format,
            proceeding_file_url, registration_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id`;

        const values = [
            data.latitude,
            data.longitude,
            data.imei,
            data.user,
            data.user_name,
            data.cell_number,
            data.proceeding_type_id,
            data.proceeding_type,
            data.color,
            data.proceeding_format,
            data.proceeding_file_url,
            data.registration_date,
        ];

        const result = await poolDBSmc.query(query, values);

        socket.emit("infractionReported", actaParsed);

        res.status(200).json({
            status: "success",
            message: "Acta registrada exitosamente",
            data: { ...data, id: result.rows[0].id },
        });
    } catch (error) {
        console.error("Error emitting message to socket:", error);

        res.status(500).json({
            status: "error",
            message: "Error al emitir el mensaje al servidor de sockets",
            error: error.message,
        });
    }
});

module.exports = router;
