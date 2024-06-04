const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const amqp = require("amqp-connection-manager");
const os = require("os");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const AMQP_URL = process.env.AMQP_URL || "amqp://localhost";
const INSTANCE_ID = `${os.hostname()}-${PORT}`;

const connection = amqp.connect([AMQP_URL], {
    heartbeatIntervalInSeconds: 6000,
});

const channelWrapper = connection.createChannel({
    json: true,
});

// Servidor HTTP
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({ server });
const SUCCESS_CODE = 1;

wss.on("connection", (ws) => {
    console.log("Nuevo cliente conectado");

    ws.on("message", async (message) => {
        console.log("Mensaje recibido:", message);
        await handleMessage(ws, message);
    });

    ws.on("close", () => {
        console.log("Cliente desconectado");
    });
});

async function handleMessage(ws, message) {
    try {
        let messagesArr = [];
        const messageParsed = JSON.parse(message);

        if (Array.isArray(messageParsed)) {
            messagesArr = messageParsed;
        } else {
            messagesArr = [messageParsed];
        }

        if (messagesArr.length === 0) {
            ws.send(
                JSON.stringify({
                    codResultado: 14,
                    desResultado: "No se recibieron datos de coordenadas",
                })
            );
            return;
        }

        const validationResults = messagesArr.map((data) =>
            validateData(data, messagesArr.length > 1)
        );
        const invalidData = validationResults.filter(
            (result) => result.codResultado !== SUCCESS_CODE
        );

        if (invalidData.length > 0) {
            ws.send(JSON.stringify(invalidData));
            return;
        }

        const queueName = "transmission_queue";

        for (let i = 0; i < messagesArr.length; i += 1000) {
            const chunk = messagesArr.slice(i, i + 1000);

            await channelWrapper.sendToQueue(queueName, chunk, {
                persistent: true,
            });
        }

        ws.send(
            JSON.stringify({
                codResultado: 1,
                desResultado: "Trama(s) correctamente recibida(s) y registrada(s)",
                INSTANCE_ID,
            })
        );
    } catch (error) {
        console.error("Error al procesar el mensaje:", error);

        if (error instanceof SyntaxError) {
            ws.send(
                JSON.stringify({
                    codResultado: 3,
                    desResultado: "Verificar JSON enviado",
                })
            );
        } else {
            ws.send(
                JSON.stringify({
                    codResultado: 13,
                    desResultado: "Error al procesar el mensaje",
                })
            );
        }
    }
}

function validateData(data, mostrarPlaca = false) {
    const { placa, latitud, longitud, fechaHoraRegistroTrack, velocidad, altitud } = data;
    const mensajePlaca = mostrarPlaca ? ` para la placa ${placa}` : "";

    // Falta: Token no corresponde a una empresa de transporte(Cod 2)

    if (!placa || placa.length !== 6 || placa.includes("-")) {
        return {
            codResultado: 4,
            desResultado: `Placa ${placa} con guiones y/o con longitud diferente de 6`,
        };
    }

    if (latitud === 0) {
        return {
            codResultado: 5,
            desResultado: "Latitud no puede ser cero" + mensajePlaca,
        };
    }

    if (longitud === 0) {
        return {
            codResultado: 6,
            desResultado: "Longitud no puede ser cero" + mensajePlaca,
        };
    }

    const fechaRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (!fechaRegex.test(fechaHoraRegistroTrack)) {
        return {
            codResultado: 7,
            desResultado: "Verificar fecha ingresada (Formato)" + mensajePlaca,
        };
    }

    if (latitud >= 0 || !/^-?\d+\.\d{5,}$/.test(latitud.toString())) {
        return {
            codResultado: 8,
            desResultado:
                "Latitud debe ser negativa y tener al menos 5 decimales de precisión" +
                mensajePlaca,
        };
    }

    if (longitud >= 0 || !/^-?\d+\.\d{5,}$/.test(longitud.toString())) {
        return {
            codResultado: 9,
            desResultado:
                "Longitud debe ser negativa y tener al menos 5 decimales de precisión" +
                mensajePlaca,
        };
    }

    if (altitud && !/^-?\d+\.\d$/.test(altitud.toString())) {
        return {
            codResultado: 10,
            desResultado: "Altitud debe tener al menos 1 decimal de precisión" + mensajePlaca,
        };
    }

    if (!/^-?\d+\.\d{2}$/.test(velocidad.toString())) {
        return {
            codResultado: 11,
            desResultado: "Velocidad debe tener al menos 2 decimales de precisión" + mensajePlaca,
        };
    }

    return {
        codResultado: 1,
        desResultado: "Trama correctamente recibida y registrada" + mensajePlaca,
        INSTANCE_ID,
    };
}

app.get("/", (req, res) => {
    res.send(`Coordinates API OK!, instance ${INSTANCE_ID}`);
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
