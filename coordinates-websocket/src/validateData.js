const { SUCCESS_CODE, INSTANCE_ID } = require("./config");
const moment = require("moment-timezone");

/**
 * Valida los datos de coordenadas recibidos.
 *
 * @param {object} data - Los datos de coordenadas a validar.
 * @param {boolean} [mostrarPlaca=false] - Indica si se debe incluir la placa en los mensajes de error.
 * @returns {object} Un objeto que indica el resultado de la validación.
 * @property {number} codResultado - El código del resultado de la validación.
 * @property {string} desResultado - La descripción del resultado de la validación.
 * @property {string} [INSTANCE_ID] - El ID de la instancia (incluido solo en caso de éxito).
 */

module.exports = function validateData(data, mostrarPlaca = false) {
    const { placa, latitud, longitud, fechaHoraRegistroTrack, velocidad, altitud } = data;
    const mensajePlaca = mostrarPlaca ? ` para la placa ${placa}` : "";

    if (!placa || placa.length !== 6 || placa.includes("-")) {
        return {
            codResultado: 4,
            desResultado: `Placa ${placa} con guiones y/o con longitud diferente de 6`,
        };
    }

    if (latitud === 0) {
        return { codResultado: 5, desResultado: `Latitud no puede ser cero${mensajePlaca}` };
    }

    if (longitud === 0) {
        return { codResultado: 6, desResultado: `Longitud no puede ser cero${mensajePlaca}` };
    }

    const fechaRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

    if (!fechaRegex.test(fechaHoraRegistroTrack)) {
        return {
            codResultado: 7,
            desResultado: `Verificar fecha ingresada (Formato)${mensajePlaca}`,
        };
    }

    // Validación para no permitir fechas anteriores a hoy
    const now = moment().tz("America/Lima");
    const fechaRegistro = moment.tz(fechaHoraRegistroTrack, "YYYY-MM-DD HH:mm:ss", "America/Lima");
    const haceUnAno = now.clone().subtract(365, "days").startOf("day");
    const cincoMinutosEnElFuturo = now.clone().add(5, "minutes");

    if (fechaRegistro.isBefore(haceUnAno) || fechaRegistro.isAfter(cincoMinutosEnElFuturo)) {
        return {
            resResultado: 12,
            desResultado: `Fecha de registro debe estar dentro de los últimos 365 días y no más de 5 minutos en el futuro${mensajePlaca}`,
        };
    }

    if (latitud >= 0 || !/^-?\d+\.\d{5,}$/.test(latitud.toString())) {
        return {
            codResultado: 8,
            desResultado: `Latitud debe ser negativa y tener al menos 5 decimales de precisión${mensajePlaca}`,
        };
    }

    if (longitud >= 0 || !/^-?\d+\.\d{5,}$/.test(longitud.toString())) {
        return {
            codResultado: 9,
            desResultado: `Longitud debe ser negativa y tener al menos 5 decimales de precisión${mensajePlaca}`,
        };
    }

    if (altitud && !/^-?\d+\.\d$/.test(altitud.toString())) {
        return {
            codResultado: 10,
            desResultado: `Altitud debe tener al menos 1 decimal de precisión${mensajePlaca}`,
        };
    }

    if (!/^-?\d+\.\d{2}$/.test(velocidad.toString())) {
        return {
            codResultado: 11,
            desResultado: `Velocidad debe tener al menos 2 decimales de precisión${mensajePlaca}`,
        };
    }

    return {
        codResultado: SUCCESS_CODE,
        desResultado: `Trama correctamente recibida y registrada${mensajePlaca}`,
        INSTANCE_ID,
    };
};
