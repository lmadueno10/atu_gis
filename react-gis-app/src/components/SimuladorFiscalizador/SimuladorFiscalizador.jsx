import React, { useEffect, useRef } from "react";
import { styled } from "@mui/material/styles";
import { Container, Box, Paper, Grid, Button, Typography } from "@mui/material";
import { MapContainer as MapLeaflet, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import io from "socket.io-client";
import L from "leaflet";
import Inspector from "./Inspector";
import Imposicion from "./Imposicion";

const Item = styled(Paper)(({ theme }) => ({
    border: "1px solid #f0f0f0",
    padding: 10,
}));

function MapLogic({ markerRefs, imposicionRefs }) {
    const map = useMap();

    useEffect(() => {
        markerRefs.current.map = map;
        imposicionRefs.current.map = map;
    }, [map, markerRefs, imposicionRefs]);

    return null;
}

const getRandomColorAndRadius = () => {
    const colors = ["blue", "red", "green", "purple", "orange"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const radius = 3 + Math.random() * 7; // Radio entre 3 y 10
    return { color, radius };
};

// Crear un ícono de documento personalizado
const documentIcon = new L.Icon({
    iconUrl: "https://example.com/document-icon.png", // URL del ícono del documento
    iconSize: [25, 25], // Tamaño del ícono
    iconAnchor: [12, 25], // Punto del ícono que se alinea con la latitud y longitud
    popupAnchor: [0, -25], // Punto del ícono donde aparece el popup
});

export default function SimuladorFiscalizador() {
    const markerRefs = useRef({});
    const imposicionRefs = useRef({});

    useEffect(() => {
        const socket = io(import.meta.env.VITE_SOCKET_SERVER_URL, {});

        socket.on("connect", () => {
            console.log("Connected:", socket.id);
        });

        socket.on("message", (data = []) => {
            data.forEach(({ codInspector, latitud, longitud }) => {
                if (markerRefs.current[codInspector]) {
                    // Actualizar posición existente
                    if (markerRefs.current[codInspector].marker) {
                        markerRefs.current[codInspector].marker.setLatLng([latitud, longitud]);
                    }
                } else {
                    // Añadir nuevo marcador y actualizar markerRefs
                    const { color, radius } = getRandomColorAndRadius();

                    const marker = L.circleMarker([latitud, longitud], {
                        color: color,
                        radius: radius,
                    })
                        .addTo(markerRefs.current.map)
                        .bindPopup(
                            `Inspector: ${codInspector} <br /> Latitud: ${latitud} <br /> Longitud: ${longitud}`
                        );
                    markerRefs.current[codInspector] = { marker };
                }
            });
        });

        socket.on("imposicion", (data) => {
            const {
                codInspector,
                tipoDocumento,
                nroDocumento,
                fechaRegistro,
                notas,
                latitud,
                longitud,
            } = data;
            if (!imposicionRefs.current[codInspector]) {
                // Añadir nuevo ícono de documento y actualizar imposicionRefs
                const marker = L.marker([latitud, longitud])
                    .addTo(imposicionRefs.current.map)
                    .bindPopup(
                        `Imposición de multa<br /> 
                         Inspector: ${codInspector} <br />
                         Tipo de Documento: ${tipoDocumento} <br />
                         Número de Documento: ${nroDocumento} <br />
                         Fecha de Registro: ${fechaRegistro} <br />
                         Notas: ${notas} <br />
                         Latitud: ${latitud} <br />
                         Longitud: ${longitud} <br />
                         <b>Solo para demo(*)</b> Abrir PDF en un drawer
                         <iframe src="https://pdfobject.com/pdf/sample.pdf" />`
                    );
                imposicionRefs.current[codInspector] = { marker };
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <Container maxWidth="xl">
            <Box sx={{ flexGrow: 1 }} mt={5}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Item>
                            <Typography variant="h5">
                                Simular transmisiones de inspectores
                            </Typography>
                            <Inspector />
                        </Item>
                    </Grid>
                    <Grid item xs={6}>
                        <Item>
                            <Typography variant="h5">
                                Simular envío de documento de imposición
                            </Typography>
                            <Imposicion />
                        </Item>
                    </Grid>
                    <Grid item xs={12}>
                        <Item>
                            <MapLeaflet
                                center={[-12.0464, -77.0428]}
                                zoom={13}
                                style={{
                                    width: "100vw",
                                    height: "100vh",
                                    maxWidth: "100%",
                                    maxHeight: "calc(100vh - 64px)",
                                }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <MapLogic markerRefs={markerRefs} imposicionRefs={imposicionRefs} />
                            </MapLeaflet>
                        </Item>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}
