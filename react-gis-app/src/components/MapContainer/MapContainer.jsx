import React from "react";
import { MapContainer as MapLeaflet, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import CustomZoomControl from "../CustomZoomControl/CustomZoomControl";

export default function Map({ center = [], children, ...otherProps }) {
    return (
        <MapLeaflet
            center={center}
            zoom={13}
            style={{
                width: "100vw",
                height: "100vh",
                maxWidth: "100%",
                maxHeight: "calc(100vh - 64px)",
            }}
            zoomControl={false}
            {...otherProps}
        >
            <TileLayer
                attribution='&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <CustomZoomControl />
            {children}
        </MapLeaflet>
    );
}

/*function Map() {
    const markerRef = useRef();

    const updateMarkerPosition = (latlng) => {
        if (markerRef.current) {
            markerRef.current.setLatLng(latlng);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const latitude = 51.51 + Math.random() * 0.1 - 0.05;
            const longitude = -0.09 + Math.random() * 0.1 - 0.05;
            updateMarkerPosition([latitude, longitude]);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            style={{ width: "100vw", height: "100vh" }}
        >
            <TileLayer
                attribution='&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[51.505, -0.09]} ref={markerRef}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
        </MapContainer>
    );
}

export default Map;*/
