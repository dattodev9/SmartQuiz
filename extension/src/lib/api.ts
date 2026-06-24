// ============================================================
// Smart Quiz — API Client
// Communicates with the backend through the background worker
// ============================================================

import {
  API_ENDPOINTS,
  type GenerateQuizRequest,
  type GenerateQuizResponse,
  type GenerateSummaryRequest,
  type GenerateSummaryResponse,
  type HistoryResponse,
} from '@shared/types';

// Backend API base URL — configurable for dev/prod
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get JWT token from storage (for future auth)
    const token = await this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API request failed with status ${response.status}`
      );
    }

    return response.json() as Promise<T>;
  }

  private async getToken(): Promise<string | null> {
    try {
      const result = await chrome.storage.local.get('auth_token');
      return result.auth_token || null;
    } catch {
      return null;
    }
  }

  async generateQuiz(data: GenerateQuizRequest): Promise<GenerateQuizResponse> {
    return this.request<GenerateQuizResponse>(API_ENDPOINTS.GENERATE_QUIZ, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateSummary(data: GenerateSummaryRequest): Promise<GenerateSummaryResponse> {
    return this.request<GenerateSummaryResponse>(API_ENDPOINTS.GENERATE_SUMMARY, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getHistory(): Promise<HistoryResponse> {
    return this.request<HistoryResponse>(API_ENDPOINTS.GET_HISTORY);
  }

  async getQuiz(quizId: string): Promise<GenerateQuizResponse> {
    return this.request<GenerateQuizResponse>(`${API_ENDPOINTS.GET_QUIZ}/${quizId}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
