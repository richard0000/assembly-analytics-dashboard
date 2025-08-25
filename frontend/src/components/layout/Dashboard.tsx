import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  DashboardSummary,
  FilterParams,
  FilteredResults,
  AvailableFilters,
  ExportRequest,
} from "../../types/usage";
import { apiService } from "../../services/api";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { TimeSeriesChart } from "../charts/TimeSeriesChart";
import { EventTypeChart } from "../analytics/EventTypeChart";
import { CompanyList } from "../analytics/CompanyList";
import { FilterPanel } from "../filters/FilterPanel";
import { useDebounce } from "../../hooks/useDebounce";
import { downloadBlob } from "../../utils/downloadUtils";
import { SearchResults } from "../search/SearchResult";

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

const ControlsSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  margin-bottom: 30px;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e1e8ed;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 1rem;
  color: ${(props) => (props.active ? "#2980b9" : "#7f8c8d")};
  border-bottom: 2px solid
    ${(props) => (props.active ? "#2980b9" : "transparent")};
  transition: all 0.2s ease;

  &:hover {
    color: #2980b9;
  }
`;

const ExportSection = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-top: 20px;
`;

const ExportButton = styled.button<{ format: "csv" | "json" }>`
  background: ${(props) => (props.format === "csv" ? "#27ae60" : "#3498db")};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

const SearchResultsContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  margin-bottom: 30px;
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

interface DashboardTab {
  id: "overview" | "search";
  label: string;
}

const DASHBOARD_TABS: DashboardTab[] = [
  { id: "overview", label: "Overview" },
  { id: "search", label: "Search & Filter" },
];

export const Dashboard: React.FC = () => {
  // Core dashboard state
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab and filter state
  const [activeTab, setActiveTab] = useState<"overview" | "search">("overview");
  const [filters, setFilters] = useState<FilterParams>({
    limit: 50,
    offset: 0,
  });
  const [availableFilters, setAvailableFilters] =
    useState<AvailableFilters | null>(null);

  // Search and results state
  const [searchResults, setSearchResults] = useState<FilteredResults | null>(
    null
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | undefined>(undefined);
  const [exportLoading, setExportLoading] = useState(false);

  // Debounce search text input
  const debouncedSearchText = useDebounce(filters.search_text, 300);

  // Load initial dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getDashboardSummary();
        setSummary(data);

        // Extract available filters from summary data
        const availableCompanies = data.top_companies.map((c) => c.company_id);
        const availableEventTypes = Object.keys(data.event_types);
        const dates = data.recent_events
          .map((e) => e.created_at)
          .filter(Boolean);

        setAvailableFilters({
          companies: availableCompanies,
          event_types: availableEventTypes,
          date_range: {
            min:
              dates.length > 0
                ? Math.min(
                    ...dates.map((d) => new Date(d).getTime())
                  ).toString()
                : "",
            max:
              dates.length > 0
                ? Math.max(
                    ...dates.map((d) => new Date(d).getTime())
                  ).toString()
                : "",
          },
        });
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

  // Perform search when filters change or search text is debounced
  useEffect(() => {
    if (activeTab === "search") {
      performSearch();
    }
  }, [
    activeTab,
    debouncedSearchText,
    filters.start_date,
    filters.end_date,
    filters.company_ids,
    filters.event_types,
    filters.limit,
    filters.offset,
  ]);

  const performSearch = async () => {
    try {
      setSearchLoading(true);
      setSearchError(undefined);

      const searchFilters = {
        ...filters,
        search_text: debouncedSearchText,
      };

      const results = await apiService.searchEvents(searchFilters);
      setSearchResults(results);
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : "Failed to search events"
      );
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: FilterParams) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
      offset: 0, // Reset pagination when filters change
    }));
  };

  const handleLoadMore = () => {
    if (searchResults) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        offset: (prevFilters.offset || 0) + (prevFilters.limit || 50),
      }));
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    try {
      setExportLoading(true);

      const exportRequest: ExportRequest = {
        format,
        filters: {
          ...filters,
          search_text: debouncedSearchText,
        },
      };

      const { blob, filename } = await apiService.exportData(exportRequest);
      downloadBlob(blob, filename);
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : "Failed to export data"
      );
    } finally {
      setExportLoading(false);
    }
  };

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

      <ControlsSection>
        <TabContainer>
          {DASHBOARD_TABS.map((tab) => (
            <Tab
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Tab>
          ))}
        </TabContainer>

        {activeTab === "search" && availableFilters && (
          <FilterPanel
            filters={filters}
            availableFilters={availableFilters}
            onFiltersChange={handleFiltersChange}
            onExport={handleExport}
            isLoading={exportLoading}
          />
        )}
      </ControlsSection>

      {activeTab === "overview" && (
        <>
          <StatsGrid>
            <StatCard>
              <h3>Total Events</h3>
              <div className="value">
                {summary.total_events.toLocaleString()}
              </div>
              <div className="subtitle">Across all companies</div>
            </StatCard>

            <StatCard>
              <h3>Active Companies</h3>
              <div className="value">{summary.unique_companies}</div>
              <div className="subtitle">With recorded activity</div>
            </StatCard>

            <StatCard>
              <h3>Event Types</h3>
              <div className="value">
                {Object.keys(summary.event_types).length}
              </div>
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
                    <div className="event-company">
                      Company: {event.company_id}
                    </div>
                  </div>
                ))
              )}
            </RecentEventsList>
          </AnalyticsGrid>
        </>
      )}

      {activeTab === "search" && (
        <SearchResultsContainer>
          <SearchResults
            results={searchResults}
            filters={filters}
            isLoading={searchLoading}
            error={searchError}
          />
        </SearchResultsContainer>
      )}
    </DashboardContainer>
  );
};
