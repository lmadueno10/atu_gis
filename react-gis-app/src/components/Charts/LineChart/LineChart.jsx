import React from "react";
import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const sampleData = [
    { name: "12:00", velocidad: 60.51 },
    { name: "12:01", velocidad: 61.12 },
    { name: "12:02", velocidad: 62.0 },
    { name: "12:03", velocidad: 63.45 },
    { name: "12:04", velocidad: 64.0 },
];

export default function LineChartComponent({ data = sampleData }) {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
                <Line type="monotone" dataKey="velocidad" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
            </LineChart>
        </ResponsiveContainer>
    );
}
