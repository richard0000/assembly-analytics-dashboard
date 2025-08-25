import React from "react";
import styled from "styled-components";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const ChartContainer = styled.div`
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;

  h3 {
    color: #34495e;
    margin-bottom: 20px;
    font-size: 1.2rem;
    text-align: center;
  }
`;

interface EventTypeChartProps {
  eventTypes: Record<string, number>;
  title?: string;
}

const COLORS = [
  "#3498db",
  "#e74c3c",
  "#2ecc71",
  "#f39c12",
  "#9b59b6",
  "#1abc9c",
];

export const EventTypeChart: React.FC<EventTypeChartProps> = ({
  eventTypes,
  title = "Event Types Distribution",
}) => {
  if (!eventTypes || Object.keys(eventTypes).length === 0) {
    return (
      <ChartContainer>
        <h3>{title}</h3>
        <p style={{ color: "#7f8c8d", textAlign: "center", padding: "40px 0" }}>
          No event type data available
        </p>
      </ChartContainer>
    );
  }

  const data = Object.entries(eventTypes).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <ChartContainer>
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e1e8ed",
              borderRadius: "4px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
