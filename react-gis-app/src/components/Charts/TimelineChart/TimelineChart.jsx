import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { name: "12:00", event: 1 },
    { name: "12:15", event: 1 },
    { name: "12:30", event: 1 },
    { name: "12:45", event: 1 },
    { name: "13:00", event: 1 },
];

export default function TimelineComponent() {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="event" stroke="#8884d8" dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}
