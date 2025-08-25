export interface UsageEvent {
  id: string;
  created_at: string;
  company_id: string;
  type: string;
  content: string;
  attribute: string;
  updated_at: string;
  original_timestamp: string;
  value: string;
}

export interface FilterParams {
  start_date?: string;
  end_date?: string;
  company_ids?: string[];
  event_types?: string[];
  search_text?: string;
  limit?: number;
  offset?: number;
}
export interface FilteredResults {
  events: UsageEvent[];
  total_count: number;
  filtered_count: number;
}
export interface ExportRequest {
  format: "csv" | "json";
  filters: FilterParams;
}
export interface AvailableFilters {
  companies: string[];
  event_types: string[];
  date_range: {
    min: string;
    max: string;
  };
}
export interface TimeSeriesPoint {
  date: string;
  count: number;
  value?: string;
}
export interface CompanyAnalytics {
  company_id: string;
  event_count: number;
  last_activity: string;
  event_types: Record<string, number>;
}
export interface DashboardSummary {
  total_events: number;
  unique_companies: number;
  event_types: Record<string, number>;
  recent_events: UsageEvent[];
  time_range: {
    start: string;
    end: string;
  };
  time_series_data: TimeSeriesPoint[];
  top_companies: CompanyAnalytics[];
  daily_trends: Record<string, TimeSeriesPoint[]>;
  available_filters: AvailableFilters;
}
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}
