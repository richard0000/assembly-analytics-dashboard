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
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}
