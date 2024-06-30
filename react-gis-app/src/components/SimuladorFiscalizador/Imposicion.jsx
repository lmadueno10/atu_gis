import React from "react";
import { Button } from "@mui/material";

const Imposicion = () => {
    const handleClick = async () => {
        const data = {
            codInspector: "12345",
            tipoDocumento: "Acta",
            nroDocumento: "ACTA-67890",
            fechaRegistro: "2024-06-20T15:30:00Z",
            notas: "Inspección realizada sin observaciones.",
            latitud: -12.046374,
            longitud: -77.042793,
        };

        try {
            const response = await fetch(import.meta.env.VITE_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Success:", result);
            } else {
                console.error("Error:", response.statusText);
                alert("Error al enviar la alerta");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error al enviar la alerta");
        }
    };

    return (
        <Button variant="contained" onClick={handleClick}>
            Enviar Documento de Imposición
        </Button>
    );
};

export default Imposicion;
