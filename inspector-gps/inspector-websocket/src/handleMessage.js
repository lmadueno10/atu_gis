const validateData = require("./validateData");
const { QUEUE_NAME, SUCCESS_CODE, ERROR_CODES, INSTANCE_ID } = require("./config");

/**
 * Maneja los mensajes recibidos a través de WebSocket.
 *
 * @param {object} ws - El WebSocket del cliente.
 * @param {string} message - El mensaje recibido en formato JSON.
 * @param {number} companyId - El ID de la empresa asociada al token validado.
 * @param {object} channelWrapper - El canal de AMQP para enviar mensajes a la cola.
 * @returns {Promise<void>}
 */
module.exports = async function handleMessage(ws, message, companyId, channelWrapper) {
    try {
        const messagesArr = Array.isArray(JSON.parse(message))
            ? JSON.parse(message)
            : [JSON.parse(message)];

        const totalInspectors = messagesArr.length;
        let inspectorsProcessedSuccessfully = 0;
        let inspectorsWithErrors = 0;
        const errorDetails = [];

        messagesArr.forEach((data) => {
            const result = validateData(data, messagesArr.length > 1);
            if (result.codResultado === SUCCESS_CODE) {
                inspectorsProcessedSuccessfully++;
            } else {
                inspectorsWithErrors++;
                errorDetails.push(result);
            }
        });

        const queueName = QUEUE_NAME;

        if (inspectorsProcessedSuccessfully > 0) {
            for (let i = 0; i < messagesArr.length; i += 1000) {
                const chunk = messagesArr.slice(i, i + 1000).map((msg) => ({
                    ...msg,
                    companyId,
                }));
                await channelWrapper.sendToQueue(queueName, chunk, { persistent: true });
            }
        }

        ws.send(
            JSON.stringify({
                codResultado:
                    inspectorsWithErrors > 0 ? ERROR_CODES.PARTIAL_SUCCESS.code : SUCCESS_CODE,
                desResultado:
                    inspectorsWithErrors > 0
                        ? "Algunos registros tienen errores."
                        : "Trama(s) correctamente recibida(s) y registrada(s).",
                resResultado: {
                    totalInspectores: totalInspectors,
                    inspectoresProcesadosCorrectamente: inspectorsProcessedSuccessfully,
                    inspectoresConErrores: inspectorsWithErrors,
                },
                detallesErrores: errorDetails,
            })
        );
    } catch (error) {
        console.error("Error processing the message:", message, error);
        const responseError =
            error instanceof SyntaxError ? ERROR_CODES.JSON_SYNTAX : ERROR_CODES.PROCESS_ERROR;
        ws.send(JSON.stringify(responseError));
    }
};
