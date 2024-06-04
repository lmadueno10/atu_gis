import { check } from "k6";
import ws from "k6/ws";
import { sleep } from "k6";

export const options = {
    stages: [
        { duration: "20s", target: 11000 },
        { duration: "20s", target: 11000 },
        { duration: "20s", target: 0 },
    ],
};

function generateUniquePlate(vuId) {
    const prefix = "U";
    const suffix = String(vuId).padStart(5, "0");
    return `${prefix}${suffix}`;
}

export default function () {
    const url = "ws://localhost/ws";
    const params = {};

    const response = ws.connect(url, params, function (socket) {
        socket.on("open", function open() {
            console.log("connected");
            const plate = generateUniquePlate(__VU);
            socket.send(
                JSON.stringify({
                    placa: plate,
                    latitud: -12.021205282760901,
                    longitud: -77.03193608604856,
                    fechaHoraRegistroTrack: "2024-06-02 12:34:57",
                    velocidad: 55.75,
                    altitud: 165.5,
                })
            );

            socket.on("message", function (data) {
                console.log("Received message: ", data);
                check(data, {
                    "message received": (d) =>
                        d.includes("Trama correctamente recibida y registrada"),
                });
                socket.close();
            });

            socket.on("close", () => console.log("disconnected"));

            socket.setTimeout(() => {
                console.log("5 seconds passed, closing the socket");
                socket.close();
            }, 5000);
        });
    });

    check(response, { "status is 101": (r) => r && r.status === 101 });
    sleep(1);
}
