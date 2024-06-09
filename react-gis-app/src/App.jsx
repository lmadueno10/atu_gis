import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import io from "socket.io-client";
import MapContainer from "./components/MapContainer/MapContainer";
import { Marker, Popup } from "react-leaflet";
import MainLayout from "./layouts/MainLayout/MainLayout";
import StatsPanel from "./components/StatsPanel/StatsPanel";

function App() {
    const [markers, setMarkers] = useState([
        { placa: "BXX001", position: [-12.0464, -77.0428] },
        { placa: "DEF456", position: [-12.0455, -77.0301] },
        { placa: "GHI789", position: [-12.0483, -77.0283] },
        { placa: "GUT123", position: [-12.05, -77.04] },
    ]);
    const markerRefs = useRef([]);
    const VITE_SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

    useEffect(() => {
        const socket = io("http://localhost:9090", {
            path: "/socket-io/",
        });

        //console.log("VITE_SOCKET_SERVER_URL", import.meta.env.VITE_SOCKET_SERVER_URL);

        socket.on("connect", () => {
            alert(socket.id);
            console.log("socket.id", socket.id);
            const selectedPlaca = ["BXX001", "AVX107"];
            socket.emit("subscribeToPlaca", selectedPlaca);
            //socket.emit("unsubscribeFromPlaca");
            console.log("Conectado al servidor de sockets");
        });

        socket.on("newCoordinates", (data = []) => {
            console.error(data);
            data.forEach(({ placa, latitud, longitud }) => {
                if (markerRefs.current[placa] && markerRefs.current[placa].current) {
                    markerRefs.current[placa].current.setLatLng([latitud, longitud]);
                }
            });

            /*const { placa, latitud, longitud } = data;

            if (markerRefs.current[placa] && markerRefs.current[placa].current) {
                markerRefs.current[placa].current.setLatLng([latitud, longitud]);
            }*/

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
            <MapContainer center={[-12.0464, -77.0428]}>
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
