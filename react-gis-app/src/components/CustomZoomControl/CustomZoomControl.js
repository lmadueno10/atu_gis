import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function CustomZoomControl() {
    const map = useMap();

    useEffect(() => {
        const zoomControl = L.control.zoom({ position: "bottomleft" });
        zoomControl.addTo(map);

        return () => {
            zoomControl.remove();
        };
    }, [map]);

    return null;
}
