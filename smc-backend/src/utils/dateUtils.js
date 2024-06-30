const moment = require("moment");

// Función para validar y formatear la fecha
const validateAndFormatDate = (dateStr) => {
    const formats = ["DD/MM/YYYY", "DD/MM/YYYY HH:mm"];
    for (let format of formats) {
        const date = moment(dateStr, format, true);
        if (date.isValid()) {
            return date.format("YYYY-MM-DD HH:mm:ss");
        }
    }
    return null;
};

module.exports = {
    validateAndFormatDate,
};
