// Configuración base de la API
export const API_BASE_URL = 'http://localhost:3001/api';

// Configuración de headers por defecto
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Cliente HTTP base
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Instancia del cliente API
export const apiClient = new ApiClient(API_BASE_URL);

// Tipos de datos comunes
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'freelancer' | 'company';
  userType: 'freelancer' | 'company';
  skills?: string[];
  location?: string;
  avatar?: string;
  reputation?: number;
  verified?: boolean;
  createdAt: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetType?: 'fixed' | 'hourly';
  skills: string[];
  client: string | User;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  deadline?: string;
  proposals?: number;
  location?: string;
  urgency?: 'low' | 'medium' | 'high';
  experienceLevel?: 'entry' | 'intermediate' | 'expert';
  projectType?: 'one-time' | 'ongoing';
  estimatedDuration?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  userType: 'freelancer' | 'company';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Helper para manejar errores de API
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ha ocurrido un error inesperado';
};