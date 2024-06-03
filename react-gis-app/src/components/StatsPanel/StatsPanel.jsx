import React from "react";
import { Stack } from "@mui/material";
import ChartContainer from "../ChartContainer/ChartContainer";
import LineChartComponent from "../Charts/LineChart/LineChart";
import PieChartComponent from "../Charts/PieChart/PieChart";
import ScatterChartComponent from "../Charts/ScatterChart/ScatterChart";
import TimelineComponent from "../Charts/TimelineChart/TimelineChart";
import AreaChartComponent from "../Charts/AreaChart/AreaChart";
import CustomControlIcon from "../CustomControlIcon/CustomControlIcon";

export default function StatsPanel() {
    return (
        <CustomControlIcon>
            <Stack spacing={2}>
                <ChartContainer title="Historial de Velocidad del Vehículo">
                    <LineChartComponent />
                </ChartContainer>
                <ChartContainer title="Distribución de Vehículos por Empresa">
                    <PieChartComponent />
                </ChartContainer>
                <ChartContainer title="Relación entre Velocidad y Altitud">
                    <ScatterChartComponent />
                </ChartContainer>
                <ChartContainer title="Gráfico de Área de Velocidad">
                    <AreaChartComponent />
                </ChartContainer>
                <ChartContainer title="Eventos del Vehículo en la Línea de Tiempo">
                    <TimelineComponent />
                </ChartContainer>
            </Stack>
        </CustomControlIcon>
    );
}
