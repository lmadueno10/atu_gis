import ws from "k6/ws";
import { check } from "k6";
import { sleep } from "k6";
import { coordenadas } from "./data.js";

export const options = {
    stages: [
        { duration: "1m", target: 10000 }, // Simula 50 usuarios durante 1 minuto
        { duration: "3m", target: 20000 }, // Luego, 100 usuarios durante 3 minutos
        { duration: "1m", target: 0 }, // Finalmente, reduce a 0 usuarios durante 1 minuto
    ],
};

export default function () {
    const url = "ws://localhost/ws";

    const res = ws.connect(url, null, function (socket) {
        socket.on("open", function () {
            console.log("Connected");
            socket.send(JSON.stringify(coordenadas));
        });

        socket.on("message", function (message) {
            console.log(`Received message: ${message}`);
        });

        socket.on("close", function () {
            console.log("Disconnected");
        });

        socket.on("error", function (e) {
            if (e.error() != "websocket: close sent") {
                console.log("An unexpected error occurred: ", e.error());
            }
        });

        sleep(1);
    });

    check(res, { "status is 101": (r) => r && r.status === 101 });
}
