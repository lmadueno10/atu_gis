import React from "react";
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { x: 30, y: 20 },
    { x: 50, y: 30 },
    { x: 70, y: 80 },
    { x: 90, y: 100 },
    { x: 100, y: 150 },
];

export default function ScatterPlotComponent() {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <ScatterChart>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" name="Velocidad" />
                <YAxis type="number" dataKey="y" name="Altitud" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter name="A" data={data} fill="#8884d8" />
            </ScatterChart>
        </ResponsiveContainer>
    );
}
