import React, { useEffect, useRef, useState } from "react";
import { Button } from "@mui/material";
import io from "socket.io-client";

const generateRandomLocation = () => {
    // Rango de latitud y longitud para Lima, Perú
    const minLat = -12.08;
    const maxLat = -12.0;
    const minLng = -77.1;
    const maxLng = -77.0;

    const latitud = minLat + Math.random() * (maxLat - minLat);
    const longitud = minLng + Math.random() * (maxLng - minLng);
    return { latitud, longitud };
};

const generateInspectorData = (id) => {
    const { latitud, longitud } = generateRandomLocation();
    return {
        codInspector: `Inspector${id.toString().padStart(3, "0")}`,
        latitud,
        longitud,
    };
};

export default function Inspector() {
    const socketRef = useRef(null);
    const intervalRefs = useRef([]);
    const [transmitting, setTransmitting] = useState(false);

    const transmitData = (id) => {
        const data = generateInspectorData(id);
        socketRef.current.emit("message", [data]);
    };

    useEffect(() => {
        /*socketRef.current = io(import.meta.env.VITE_SOCKET_SERVER_URL);

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };*/
    }, []);

    const handleTransmitData = () => {
        if (transmitting) return;
        setTransmitting(true);

        // Configura un intervalo para cada inspector que transmite datos cada 3 segundos
        for (let i = 1; i <= 100; i++) {
            // Retrasa el inicio de cada intervalo para una carga progresiva
            const delay = i * 100; // Retraso de 100ms por cada inspector
            const interval = setTimeout(() => {
                transmitData(i); // Transmitir inmediatamente
                const intervalId = setInterval(() => transmitData(i), 3000);
                intervalRefs.current.push(intervalId);
            }, delay);
            intervalRefs.current.push(interval);
        }
    };

    const handleStopTransmitData = () => {
        setTransmitting(false);
        // Limpia todos los intervalos
        intervalRefs.current.forEach(clearInterval);
        intervalRefs.current = [];
    };

    return (
        <div>
            <Button variant="contained" onClick={handleTransmitData} disabled={transmitting}>
                Transmitir coordenadas
            </Button>
            <Button
                variant="contained"
                color="error"
                onClick={handleStopTransmitData}
                disabled={!transmitting}
                style={{ marginLeft: "10px" }}
            >
                Detener transmisión
            </Button>
        </div>
    );
}
