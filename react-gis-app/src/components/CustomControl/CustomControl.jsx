import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { createRoot } from "react-dom/client";

const CustomControl = ({ position = "topright", children }) => {
    const map = useMap();

    useEffect(() => {
        const customControl = L.control({ position });

        customControl.onAdd = function () {
            const div = L.DomUtil.create("div", "custom-control");

            L.DomEvent.disableClickPropagation(div);
            L.DomEvent.disableScrollPropagation(div);

            const root = createRoot(div);
            root.render(children);

            return div;
        };

        customControl.addTo(map);

        return () => {
            customControl.remove();
        };
    }, [map, position, children]);

    return null;
};

export default CustomControl;
