import React from "react";
import styled from "styled-components";
import { CompanyAnalytics } from "../../types/usage";

const CompanyListContainer = styled.div`
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
`;

const CompanyItem = styled.div`
  padding: 15px 0;
  border-bottom: 1px solid #ecf0f1;

  &:last-child {
    border-bottom: none;
  }

  .company-header {
    display: flex;
    justify-content: between;
    align-items: center;
    margin-bottom: 8px;
  }

  .company-id {
    font-weight: 600;
    color: #2c3e50;
    font-family: "Courier New", monospace;
    font-size: 0.9rem;
  }

  .event-count {
    color: #3498db;
    font-weight: 600;
  }

  .last-activity {
    color: #7f8c8d;
    font-size: 0.85rem;
    margin-bottom: 10px;
  }

  .event-types {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .event-type-badge {
    background: #ecf0f1;
    color: #34495e;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;

    .count {
      background: #3498db;
      color: white;
      padding: 2px 6px;
      border-radius: 8px;
      margin-left: 4px;
      font-size: 0.7rem;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #7f8c8d;
  padding: 40px 0;
`;

interface CompanyListProps {
  companies: CompanyAnalytics[];
  title?: string;
}

export const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  title = "Top Active Companies",
}) => {
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

  if (!companies || companies.length === 0) {
    return (
      <CompanyListContainer>
        <h3>{title}</h3>
        <EmptyState>No company data available</EmptyState>
      </CompanyListContainer>
    );
  }

  return (
    <CompanyListContainer>
      <h3>{title}</h3>
      {companies.map((company) => (
        <CompanyItem key={company.company_id}>
          <div className="company-header">
            <span className="company-id">{company.company_id}</span>
            <span className="event-count">{company.event_count} events</span>
          </div>
          <div className="last-activity">
            Last activity: {formatDate(company.last_activity)}
          </div>
          <div className="event-types">
            {Object.entries(company.event_types).map(([type, count]) => (
              <span key={type} className="event-type-badge">
                {type}
                <span className="count">{count}</span>
              </span>
            ))}
          </div>
        </CompanyItem>
      ))}
    </CompanyListContainer>
  );
};
