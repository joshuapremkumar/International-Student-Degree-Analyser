import axios, { AxiosError } from 'axios';
import type { SearchResponse, ApiError } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

export async function searchUniversities(degree: string): Promise<SearchResponse> {
  try {
    const response = await api.post<SearchResponse>('/search', { degree });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(
        axiosError.response?.data?.message || 
        axiosError.message || 
        'Failed to search universities'
      );
    }
    throw error;
  }
}

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const response = await api.get('/health');
  return response.data;
}

export default api;
