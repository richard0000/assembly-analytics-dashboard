import { DashboardSummary, ApiResponse } from '../types/usage';

const API_BASE_URL = 'http://localhost:8080';

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

  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.get<DashboardSummary>('/dashboard/summary');
  }

  async healthCheck(): Promise<any> {
    return this.get<any>('/health');
  }
}

export const apiService = new ApiService();