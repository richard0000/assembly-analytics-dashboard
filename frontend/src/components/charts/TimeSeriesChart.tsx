import React from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimeSeriesPoint } from '../../types/usage';

const ChartContainer = styled.div`
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  margin-bottom: 30px;
  
  h3 {
    color: #34495e;
    margin-bottom: 20px;
    font-size: 1.2rem;
  }
`;

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  title?: string;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ 
  data, 
  title = "Usage Over Time" 
}) => {
  if (!data || data.length === 0) {
    return (
      <ChartContainer>
        <h3>{title}</h3>
        <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '40px 0' }}>
          No time series data available
        </p>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#7f8c8d' }}
            stroke="#bdc3c7"
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#7f8c8d' }}
            stroke="#bdc3c7"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e1e8ed',
              borderRadius: '4px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#3498db" 
            strokeWidth={2}
            dot={{ fill: '#3498db', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#2980b9' }}
            name="Events"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
