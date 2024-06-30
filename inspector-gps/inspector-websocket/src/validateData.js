const { SUCCESS_CODE, INSTANCE_ID } = require("./config");
const moment = require("moment-timezone");

/**
 * Valida los datos de coordenadas recibidos.
 *
 * @param {object} data - Los datos de coordenadas a validar.
 * @param {boolean} [mostrarInspector=false] - Indica si se debe incluir el ID del inspector en los mensajes de error.
 * @returns {object} Un objeto que indica el resultado de la validación.
 * @property {number} codResultado - El código del resultado de la validación.
 * @property {string} desResultado - La descripción del resultado de la validación.
 * @property {string} [INSTANCE_ID] - El ID de la instancia (incluido solo en caso de éxito).
 */

module.exports = function validateData(data, mostrarInspector = false) {
    const { codInspector, latitud, longitud, fechaHoraRegistroTrack, velocidad, altitud } = data;
    const mensajeInspector = mostrarInspector ? ` para el inspector ${codInspector}` : "";

    if (!codInspector || typeof codInspector !== "string" || codInspector.length < 3) {
        return {
            codResultado: 4,
            desResultado: `ID del inspector ${codInspector} es inválido o demasiado corto`,
        };
    }

    if (latitud === 0) {
        return { codResultado: 5, desResultado: `Latitud no puede ser cero${mensajeInspector}` };
    }

    if (longitud === 0) {
        return { codResultado: 6, desResultado: `Longitud no puede ser cero${mensajeInspector}` };
    }

    const fechaRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

    if (!fechaRegex.test(fechaHoraRegistroTrack)) {
        return {
            codResultado: 7,
            desResultado: `Verificar fecha ingresada (Formato)${mensajeInspector}`,
        };
    }

    // Validación para no permitir fechas anteriores a hoy
    const now = moment().tz("America/Lima");
    const fechaRegistro = moment.tz(fechaHoraRegistroTrack, "YYYY-MM-DD HH:mm:ss", "America/Lima");
    const haceUnAno = now.clone().subtract(365, "days");
    const cincoMinutosEnElFuturo = now.clone().add(5, "minutes");

    if (fechaRegistro.isBefore(haceUnAno) || fechaRegistro.isAfter(cincoMinutosEnElFuturo)) {
        return {
            codResultado: 12,
            desResultado: `Fecha de registro debe estar dentro de los últimos 365 días y no más de 5 minutos en el futuro${mensajeInspector}`,
        };
    }

    if (latitud >= 0 || !/^-?\d+\.\d{5,}$/.test(latitud.toString())) {
        return {
            codResultado: 8,
            desResultado: `Latitud debe ser negativa y tener al menos 5 decimales de precisión${mensajeInspector}`,
        };
    }

    if (longitud >= 0 || !/^-?\d+\.\d{5,}$/.test(longitud.toString())) {
        return {
            codResultado: 9,
            desResultado: `Longitud debe ser negativa y tener al menos 5 decimales de precisión${mensajeInspector}`,
        };
    }

    if (altitud && !/^-?\d+\.\d$/.test(altitud.toString())) {
        return {
            codResultado: 10,
            desResultado: `Altitud debe tener al menos 1 decimal de precisión${mensajeInspector}`,
        };
    }

    if (!/^-?\d+\.\d{2}$/.test(velocidad.toString())) {
        return {
            codResultado: 11,
            desResultado: `Velocidad debe tener al menos 2 decimales de precisión${mensajeInspector}`,
        };
    }

    return {
        codResultado: SUCCESS_CODE,
        desResultado: `Trama correctamente recibida y registrada${mensajeInspector}`,
        INSTANCE_ID,
    };
};
