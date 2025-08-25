import React from "react";
import styled from "styled-components";
import { FilteredResults, FilterParams } from "../../types/usage";

const ResultsContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  overflow: hidden;
`;

const ResultsHeader = styled.div`
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e8ed;

  h3 {
    margin: 0 0 10px 0;
    color: #34495e;
    font-size: 1.1rem;
  }

  .stats {
    color: #7f8c8d;
    font-size: 0.9rem;
  }

  .highlight {
    color: #3498db;
    font-weight: 600;
  }
`;

const EventList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const EventItem = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #ecf0f1;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8f9fa;
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const EventType = styled.span<{ $type: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;

  ${(props) => {
    switch (props.$type) {
      case "Action":
        return "background: #3498db; color: white;";
      case "CumulativeMetric":
        return "background: #e74c3c; color: white;";
      case "Metric":
        return "background: #2ecc71; color: white;";
      default:
        return "background: #95a5a6; color: white;";
    }
  }}
`;

const EventTime = styled.span`
  color: #7f8c8d;
  font-size: 0.8rem;
`;

const EventContent = styled.div`
  color: #2c3e50;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 8px;
`;

const EventDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  font-size: 0.8rem;
  color: #7f8c8d;

  .detail {
    display: flex;

    .label {
      font-weight: 500;
      margin-right: 8px;
      min-width: 60px;
    }

    .value {
      font-family: "Courier New", monospace;
      color: #34495e;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;

  .icon {
    font-size: 3rem;
    margin-bottom: 20px;
    opacity: 0.5;
  }

  h4 {
    margin: 0 0 10px 0;
    color: #34495e;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
  }
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #7f8c8d;

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #ecf0f1;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 10px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

interface SearchResultsProps {
  results: FilteredResults | null;
  filters: FilterParams;
  isLoading: boolean;
  error?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  filters,
  isLoading,
  error,
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

  const highlightSearchText = (text: string, searchText?: string): string => {
    if (!searchText) return text;

    const regex = new RegExp(`(${searchText})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  };

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof FilterParams];
    return (
      value !== undefined &&
      value !== "" &&
      (Array.isArray(value) ? value.length > 0 : true)
    );
  });

  if (error) {
    return (
      <ResultsContainer>
        <ResultsHeader>
          <h3>⚠️ Error</h3>
          <div className="stats">{error}</div>
        </ResultsHeader>
      </ResultsContainer>
    );
  }

  return (
    <ResultsContainer>
      <ResultsHeader>
        <h3>📋 Search Results</h3>
        <div className="stats">
          {isLoading ? (
            "Searching..."
          ) : results ? (
            <>
              Showing <span className="highlight">{results.events.length}</span>{" "}
              of <span className="highlight">{results.filtered_count}</span>{" "}
              filtered results
              {results.total_count !== results.filtered_count && (
                <> (from {results.total_count} total events)</>
              )}
              {hasActiveFilters && " • Filters active"}
            </>
          ) : (
            "No search performed yet"
          )}
        </div>
      </ResultsHeader>

      {isLoading ? (
        <LoadingState>
          <div className="spinner"></div>
          Searching events...
        </LoadingState>
      ) : !results ? (
        <EmptyState>
          <div className="icon">🔍</div>
          <h4>Search for Events</h4>
          <p>Use the filters above to search through your usage data</p>
        </EmptyState>
      ) : results.events.length === 0 ? (
        <EmptyState>
          <div className="icon">📭</div>
          <h4>No Results Found</h4>
          <p>Try adjusting your filters or search terms</p>
        </EmptyState>
      ) : (
        <EventList>
          {results.events.map((event) => (
            <EventItem key={event.id}>
              <EventHeader>
                <EventType $type={event.type}>{event.type}</EventType>
                <EventTime>{formatDate(event.created_at)}</EventTime>
              </EventHeader>

              <EventContent
                dangerouslySetInnerHTML={{
                  __html: highlightSearchText(
                    event.content,
                    filters.search_text
                  ),
                }}
              />

              <EventDetails>
                <div className="detail">
                  <span className="label">Company:</span>
                  <span className="value">{event.company_id}</span>
                </div>
                <div className="detail">
                  <span className="label">Attribute:</span>
                  <span className="value">{event.attribute}</span>
                </div>
                {event.value && (
                  <div className="detail">
                    <span className="label">Value:</span>
                    <span
                      className="value"
                      style={{ color: "#27ae60", fontWeight: "600" }}
                    >
                      {event.value}
                    </span>
                  </div>
                )}
                <div className="detail">
                  <span className="label">ID:</span>
                  <span className="value">{event.id.slice(0, 8)}...</span>
                </div>
              </EventDetails>
            </EventItem>
          ))}
        </EventList>
      )}
    </ResultsContainer>
  );
};
