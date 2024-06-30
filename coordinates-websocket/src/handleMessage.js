const validateData = require("./validateData");
const { QUEUE_NAME, SUCCESS_CODE, ERROR_CODES, INSTANCE_ID } = require("./config");

/**
 * Maneja los mensajes recibidos a través de WebSocket.
 *
 * @param {object} ws - El WebSocket del cliente.
 * @param {string} message - El mensaje recibido en formato JSON.
 * @param {number} empresaId - El ID de la empresa asociada al token validado.
 * @param {object} channelWrapper - El canal de AMQP para enviar mensajes a la cola.
 * @returns {Promise<void>}
 */
module.exports = async function handleMessage(ws, message, empresaId, channelWrapper) {
    try {
        const messagesArr = Array.isArray(JSON.parse(message))
            ? JSON.parse(message)
            : [JSON.parse(message)];

        if (messagesArr.length === 0) {
            ws.send(
                JSON.stringify({
                    codResultado: ERROR_CODES.DATA_MISSING.code,
                    desResultado: ERROR_CODES.DATA_MISSING.message,
                })
            );
            return;
        }

        const totalPlates = messagesArr.length;
        let platesProcessedSuccessfully = 0;
        let platesWithErrors = 0;
        const errorDetails = [];

        messagesArr.forEach((data) => {
            const result = validateData(data, true);

            if (result.codResultado === SUCCESS_CODE) {
                platesProcessedSuccessfully++;
            } else {
                platesWithErrors++;
                errorDetails.push(result);
            }
        });

        const queueName = QUEUE_NAME;

        if (platesProcessedSuccessfully > 0) {
            for (let i = 0; i < messagesArr.length; i += 1000) {
                const chunk = messagesArr.slice(i, i + 1000).map((msg) => ({
                    ...msg,
                    empresaId,
                }));
                await channelWrapper.sendToQueue(queueName, chunk, { persistent: true });
            }
        }

        ws.send(
            JSON.stringify({
                codResultado:
                    platesWithErrors > 0 ? ERROR_CODES.PARTIAL_SUCCESS.code : SUCCESS_CODE,
                desResultado:
                    platesWithErrors > 0
                        ? "Algunos registros tienen errores."
                        : "Trama(s) correctamente recibida(s) y registrada(s).",
                resResultado: {
                    totalPlacas: totalPlates,
                    placasProcesadasCorrectamente: platesProcessedSuccessfully,
                    placasConErrores: platesWithErrors,
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
