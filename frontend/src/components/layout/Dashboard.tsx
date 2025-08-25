import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { DashboardSummary } from "../../types/usage";
import { apiService } from "../../services/api";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { TimeSeriesChart } from "../charts/TimeSeriesChart";
import { EventTypeChart } from "../analytics/EventTypeChart";
import { CompanyList } from "../analytics/CompanyList";

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
    sans-serif;
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

  .data-info {
    background: #e8f5e8;
    border: 1px solid #27ae60;
    border-radius: 4px;
    padding: 10px;
    margin-top: 15px;
    color: #27ae60;
    font-size: 0.9rem;
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

  .subtitle {
    color: #7f8c8d;
    font-size: 0.85rem;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 30px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RecentEventsList = styled.div`
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;

  h3 {
    color: #34495e;
    margin-bottom: 20px;
    font-size: 1.2rem;
  }

  .event-item {
    padding: 12px 0;
    border-bottom: 1px solid #ecf0f1;

    &:last-child {
      border-bottom: none;
    }

    .event-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 5px;
    }

    .event-type {
      background: #3498db;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .event-time {
      color: #7f8c8d;
      font-size: 0.8rem;
    }

    .event-content {
      color: #2c3e50;
      font-size: 0.9rem;
      margin-bottom: 5px;
      line-height: 1.4;
    }

    .event-company {
      color: #7f8c8d;
      font-size: 0.8rem;
      font-family: "Courier New", monospace;
    }

    .event-value {
      color: #27ae60;
      font-weight: 600;
      font-size: 0.85rem;
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
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <DashboardContainer>
        <ErrorMessage>Error: {error}</ErrorMessage>
      </DashboardContainer>
    );
  }

  if (!summary) {
    return (
      <DashboardContainer>
        <ErrorMessage>No dashboard data available</ErrorMessage>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <h1>Assembly Analytics Dashboard</h1>
        <p>Usage insights and metrics for customer success teams</p>
        <div className="data-info">
          📊 Real-time data from CSV files • Last updated:{" "}
          {new Date().toLocaleString()}
        </div>
      </Header>

      <StatsGrid>
        <StatCard>
          <h3>Total Events</h3>
          <div className="value">{summary.total_events.toLocaleString()}</div>
          <div className="subtitle">Across all companies</div>
        </StatCard>

        <StatCard>
          <h3>Active Companies</h3>
          <div className="value">{summary.unique_companies}</div>
          <div className="subtitle">With recorded activity</div>
        </StatCard>

        <StatCard>
          <h3>Event Types</h3>
          <div className="value">{Object.keys(summary.event_types).length}</div>
          <div className="subtitle">Different activity categories</div>
        </StatCard>

        <StatCard>
          <h3>Top Event Type</h3>
          <div className="value">
            {Object.entries(summary.event_types).sort(
              ([, a], [, b]) => b - a
            )[0]?.[1] || 0}
          </div>
          <div className="subtitle">
            {Object.entries(summary.event_types).sort(
              ([, a], [, b]) => b - a
            )[0]?.[0] || "N/A"}
          </div>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <TimeSeriesChart
          data={summary.time_series_data}
          title="Daily Usage Trends"
        />
        <EventTypeChart
          eventTypes={summary.event_types}
          title="Event Distribution"
        />
      </ChartsGrid>

      <AnalyticsGrid>
        <CompanyList
          companies={summary.top_companies}
          title="Most Active Companies"
        />

        <RecentEventsList>
          <h3>Recent Activity</h3>
          {summary.recent_events.length === 0 ? (
            <p
              style={{
                color: "#7f8c8d",
                textAlign: "center",
                padding: "40px 0",
              }}
            >
              No recent events available
            </p>
          ) : (
            summary.recent_events.map((event) => (
              <div key={event.id} className="event-item">
                <div className="event-header">
                  <span className="event-type">{event.type}</span>
                  <span className="event-time">
                    {formatDate(event.created_at)}
                  </span>
                </div>
                <div className="event-content">{event.content}</div>
                {event.value && (
                  <div className="event-value">Value: {event.value}</div>
                )}
                <div className="event-company">Company: {event.company_id}</div>
              </div>
            ))
          )}
        </RecentEventsList>
      </AnalyticsGrid>
    </DashboardContainer>
  );
};
