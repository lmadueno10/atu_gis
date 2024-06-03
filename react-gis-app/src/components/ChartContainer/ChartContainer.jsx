import { Paper, Typography } from "@mui/material";
import React from "react";

export default function ChartContainer({
    title = "Gráfico de densidad de buses por ubicación",
    textPosition = "center",
    children,
    ...otherProps
}) {
    return (
        <Paper sx={{ padding: 1 }} {...otherProps}>
            <Typography fontSize={18} gutterBottom textAlign={textPosition}>
                {title}
            </Typography>
            {children}
        </Paper>
    );
}
