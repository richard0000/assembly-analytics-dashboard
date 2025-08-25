import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DashboardSummary } from '../../types/usage';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { apiService } from '../../services/api';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const Header = styled.header`
  margin-bottom: 30px;
  
  h1 {
    color: #2c3e50;
    font-size: 2.5rem;
    margin-bottom: 10px;
  }
  
  p {
    color: #7f8c8d;
    font-size: 1.1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  
  h3 {
    color: #34495e;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
  }
  
  .value {
    color: #2980b9;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 5px;
  }
`;

const EventTypesList = styled.div`
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  
  h3 {
    color: #34495e;
    margin-bottom: 15px;
  }
  
  .event-type {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #ecf0f1;
    
    &:last-child {
      border-bottom: none;
    }
    
    .name {
      color: #2c3e50;
      font-weight: 500;
    }
    
    .count {
      color: #3498db;
      font-weight: 600;
    }
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c53030;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #fed7d7;
  margin: 20px 0;
  text-align: center;
`;

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getDashboardSummary();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <DashboardContainer>
        <ErrorMessage>
          Error: {error}
        </ErrorMessage>
      </DashboardContainer>
    );
  }

  if (!summary) {
    return (
      <DashboardContainer>
        <ErrorMessage>
          No dashboard data available
        </ErrorMessage>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <h1>Assembly Analytics Dashboard</h1>
        <p>Usage insights and metrics for customer success teams</p>
      </Header>

      <StatsGrid>
        <StatCard>
          <h3>Total Events</h3>
          <div className="value">{summary.total_events.toLocaleString()}</div>
        </StatCard>
        
        <StatCard>
          <h3>Active Companies</h3>
          <div className="value">{summary.unique_companies}</div>
        </StatCard>
        
        <StatCard>
          <h3>Event Types</h3>
          <div className="value">{Object.keys(summary.event_types).length}</div>
        </StatCard>
      </StatsGrid>

      <EventTypesList>
        <h3>Event Types Breakdown</h3>
        {Object.entries(summary.event_types).map(([type, count]) => (
          <div key={type} className="event-type">
            <span className="name">{type}</span>
            <span className="count">{count.toLocaleString()}</span>
          </div>
        ))}
      </EventTypesList>
    </DashboardContainer>
  );
};
