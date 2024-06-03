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

wss.on("connection", (ws) => {
    console.log("Nuevo cliente conectado");

    ws.on("message", async (message) => {
        try {
            const data = JSON.parse(message);
            const validationResult = validateData(data);

            if (validationResult.codResultado !== 1) {
                ws.send(JSON.stringify(validationResult));
                return;
            }

            const queueName = "transmission_queue";

            await channelWrapper.sendToQueue(queueName, data, {
                persistent: true,
            });

            ws.send(JSON.stringify(validationResult));
        } catch (error) {
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
    });

    ws.on("close", () => {
        console.log("Cliente desconectado");
    });
});

function validateData(data) {
    const { placa, latitud, longitud, fechaHoraRegistroTrack, velocidad, altitud } = data;

    // Falta: Token no corresponde a una empresa de transporte(Cod 2)

    if (!placa || placa.length !== 6 || placa.includes("-")) {
        return {
            codResultado: 4,
            desResultado: "Placa con guiones y/o con longitud diferente de 6",
        };
    }

    if (latitud === 0) {
        return {
            codResultado: 5,
            desResultado: "Latitud no puede ser cero",
        };
    }

    if (longitud === 0) {
        return {
            codResultado: 6,
            desResultado: "Longitud no puede ser cero",
        };
    }

    const fechaRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (!fechaRegex.test(fechaHoraRegistroTrack)) {
        return {
            codResultado: 7,
            desResultado: "Verificar fecha ingresada (Formato)",
        };
    }

    if (latitud >= 0 || !/^-?\d+\.\d{5,}$/.test(latitud.toString())) {
        return {
            codResultado: 8,
            desResultado: "Latitud debe ser negativa y tener al menos 5 decimales de precisión",
        };
    }

    if (longitud >= 0 || !/^-?\d+\.\d{5,}$/.test(longitud.toString())) {
        return {
            codResultado: 9,
            desResultado: "Longitud debe ser negativa y tener al menos 5 decimales de precisión",
        };
    }

    if (altitud && !/^-?\d+\.\d$/.test(altitud.toString())) {
        return {
            codResultado: 10,
            desResultado: "Altitud debe tener al menos 1 decimal de precisión",
        };
    }

    if (!/^-?\d+\.\d{2}$/.test(velocidad.toString())) {
        return {
            codResultado: 11,
            desResultado: "Velocidad debe tener al menos 2 decimales de precisión",
        };
    }

    return {
        codResultado: 1,
        desResultado: "Trama correctamente recibida y registrada",
    };
}

app.get("/", (req, res) => {
    res.send(`Coordinates API OK!, instance ${INSTANCE_ID}`);
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
