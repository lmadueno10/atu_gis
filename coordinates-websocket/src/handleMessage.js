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
            return ws.send(JSON.stringify(ERROR_CODES.DATA_MISSING));
        }

        const validationResults = messagesArr.map((data) =>
            validateData(data, messagesArr.length > 1)
        );
        const invalidData = validationResults.filter(
            (result) => result.codResultado !== SUCCESS_CODE
        );

        if (invalidData.length > 0) {
            return ws.send(JSON.stringify(invalidData));
        }

        const queueName = QUEUE_NAME;
        console.log("enviar a ", queueName);

        for (let i = 0; i < messagesArr.length; i += 1000) {
            const chunk = messagesArr.slice(i, i + 1000).map((msg) => ({
                ...msg,
                empresaId,
            }));
            await channelWrapper.sendToQueue(queueName, chunk, { persistent: true });
        }

        ws.send(
            JSON.stringify({
                codResultado: SUCCESS_CODE,
                desResultado: "Trama(s) correctamente recibida(s) y registrada(s)",
                INSTANCE_ID,
            })
        );
    } catch (error) {
        console.error("Error al procesar el mensaje:", message, error);
        const responseError =
            error instanceof SyntaxError ? ERROR_CODES.JSON_SYNTAX : ERROR_CODES.PROCESS_ERROR;
        ws.send(JSON.stringify(responseError));
    }
};
