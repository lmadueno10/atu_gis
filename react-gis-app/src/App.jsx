import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import io from "socket.io-client";
import MapContainer from "./components/MapContainer/MapContainer";
import { Marker, Popup } from "react-leaflet";
import MainLayout from "./layouts/MainLayout/MainLayout";
import StatsPanel from "./components/StatsPanel/StatsPanel";
import MultiLevelMenu from "./components/MultiLevelMenu/MultiLevelMenu";

function App() {
    const [markers, setMarkers] = useState([
        { placa: "ABC126", position: [51.505, -0.09] },
        { placa: "DEF456", position: [51.51, -0.1] },
        { placa: "GHI789", position: [51.49, -0.1] },
        { placa: "GUT123", position: [51.49, -0.1] },
    ]);
    const markerRefs = useRef([]);
    const VITE_SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

    useEffect(() => {
        const socket = io(VITE_SOCKET_SERVER_URL, {
            path: "/socket-io",
        });

        console.log("VITE_SOCKET_SERVER_URL", import.meta.env.VITE_SOCKET_SERVER_URL);

        socket.on("connect", () => {
            alert(socket.id);
            console.log("socket.id", socket.id);
            const selectedPlaca = ["GUT123"];
            socket.emit("subscribeToPlaca", selectedPlaca);
            //socket.emit("unsubscribeFromPlaca");
            console.log("Conectado al servidor de sockets");
        });

        socket.on("newCoordinates", (data) => {
            alert("JAIMITO EL CHUNKS");
            const placa = data.placa;
            const latitude = 51.51 + Math.random() * 0.1 - 0.05;
            const longitude = -0.09 + Math.random() * 0.1 - 0.05;

            if (markerRefs.current[placa] && markerRefs.current[placa].current) {
                markerRefs.current[placa].current.setLatLng([latitude, longitude]);
            }

            //console.log("Evento recibido:", data);
        });

        const unsubscribe = () => {
            socket.emit("unsubscribeFromPlaca");
            console.log("Desconectado del servidor de sockets");
        };

        return () => {
            unsubscribe();
            socket.disconnect();
        };
    }, []);

    //https://i.sstatic.net/6uSog.png

    return (
        <MainLayout>
            <MapContainer center={[51.505, -0.09]}>
                {markers.map((marker, index) => (
                    <Marker
                        key={marker.placa}
                        position={marker.position}
                        ref={
                            markerRefs.current[marker.placa] ||
                            (markerRefs.current[marker.placa] = React.createRef())
                        }
                    >
                        <Popup>
                            A pretty CSS3 popup. <br /> Easily customizable.
                        </Popup>
                    </Marker>
                ))}

                <StatsPanel />
            </MapContainer>
        </MainLayout>
    );
}

export default App;
