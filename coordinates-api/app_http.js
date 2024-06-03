/* WORKERS */
const express = require("express");
const bodyParser = require("body-parser");
const amqp = require("amqp-connection-manager");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const AMQP_URL = process.env.AMQP_URL || "amqp://localhost";

/** Tokens por EMV */
const connection = amqp.connect([AMQP_URL], {
    //rabbitmq
    heartbeatIntervalInSeconds: 6000,
});
const channelWrapper = connection.createChannel({
    json: true,
});

app.use(bodyParser.text());
app.use(cors());

app.get("/", (_, res) => {
    res.send("¡El servidor de la API está en funcionamiento rabbitmq!");
});

app.post("/coordinates", async (req, res) => {
    try {
        await channelWrapper.waitForConnect();

        const data = req.body;
        const coordinates = parseCoordinates(data);

        const queueName = "transmission_queue";
        await channelWrapper.sendToQueue(queueName, coordinates, {
            persistent: true,
        });

        res.send("Mensaje enviado correctamente a RabbitMQ.");
    } catch (error) {
        console.error("Error al enviar mensaje a RabbitMQ:", error);
        res.status(500).send("Error al enviar mensaje a RabbitMQ.");
    }
});

function parseCoordinates(data) {
    const [fecha_hora, lat, lng, velocidad, precision, bearing, placa] = data.split("|");

    if (!fecha_hora || !lat || !lng || !velocidad || !precision || !bearing || !placa) {
        throw new Error("Datos incompletos: se requieren todos los campos");
    }

    return {
        fecha_hora: new Date(fecha_hora.trim()).toISOString(),
        lat: parseFloat(lat.trim()),
        lng: parseFloat(lng.trim()),
        velocidad: parseFloat(velocidad.trim()),
        precision: parseFloat(precision.trim()),
        bearing: parseFloat(bearing.trim()),
        placa: placa.trim(),
    };
}

app.listen(PORT, () => {
    console.log(`Servidor API iniciado en el puerto ${PORT}`);
});
