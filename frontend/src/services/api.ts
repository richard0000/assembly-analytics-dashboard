import {
  DashboardSummary,
  FilterParams,
  FilteredResults,
  ExportRequest,
  ApiResponse,
} from "../types/usage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();
    return result.data;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();
    return result.data;
  }

  async downloadFile(
    endpoint: string,
    data: any
  ): Promise<{ blob: Blob; filename: string }> {
    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get("Content-Disposition");
    const filename = contentDisposition
      ? contentDisposition.split('filename="')[1]?.slice(0, -1)
      : "export.csv";

    return { blob, filename };
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.get<DashboardSummary>("/dashboard/summary");
  }

  async searchEvents(filters: FilterParams): Promise<FilteredResults> {
    const queryParams = new URLSearchParams();

    if (filters.start_date) queryParams.set("start_date", filters.start_date);
    if (filters.end_date) queryParams.set("end_date", filters.end_date);
    if (filters.company_ids?.length)
      queryParams.set("company_ids", filters.company_ids.join(","));
    if (filters.event_types?.length)
      queryParams.set("event_types", filters.event_types.join(","));
    if (filters.search_text) queryParams.set("search", filters.search_text);
    if (filters.limit) queryParams.set("limit", filters.limit.toString());
    if (filters.offset) queryParams.set("offset", filters.offset.toString());

    const endpoint = `/events/search${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return this.get<FilteredResults>(endpoint);
  }

  async exportData(
    request: ExportRequest
  ): Promise<{ blob: Blob; filename: string }> {
    return this.downloadFile("/export", request);
  }

  async healthCheck(): Promise<any> {
    return this.get<any>("/health");
  }
}

export const apiService = new ApiService();
