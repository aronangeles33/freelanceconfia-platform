import { apiClient } from '@/lib/api';

// Interfaces para búsqueda
export interface SearchFilters {
  query?: string;
  category?: string;
  skills?: string[];
  location?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    radius?: number; // en km
  };
  budget?: {
    min?: number;
    max?: number;
    type?: 'fixed' | 'hourly';
  };
  timeframe?: {
    start?: string;
    end?: string;
    duration?: 'short' | 'medium' | 'long'; // corto < 1 mes, medio 1-3 meses, largo > 3 meses
  };
  experience?: 'entry' | 'intermediate' | 'expert';
  rating?: {
    min?: number;
    max?: number;
  };
  availability?: 'available' | 'busy' | 'any';
  projectType?: 'freelance' | 'contest' | 'hourly';
  sortBy?: 'relevance' | 'rating' | 'price_low' | 'price_high' | 'newest' | 'distance';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  type: 'project' | 'freelancer';
  title: string;
  description: string;
  location?: {
    country: string;
    city: string;
    distance?: number; // distancia en km si hay geolocalización
  };
  budget?: {
    amount: number;
    type: 'fixed' | 'hourly';
    currency: string;
  };
  skills: string[];
  rating?: number;
  reviewCount?: number;
  image?: string;
  isVerified?: boolean;
  isOnline?: boolean;
  lastActive?: string;
  matchScore?: number; // 0-100 score de relevancia
  featured?: boolean;
  urgency?: 'low' | 'medium' | 'high';
  completedProjects?: number;
  responseTime?: string;
  availability?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    categories: Array<{ name: string; count: number }>;
    skills: Array<{ name: string; count: number }>;
    locations: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
  };
  suggestions?: string[];
  recommendations?: SearchResult[];
}

export interface SavedSearch {
  _id: string;
  userId: string;
  name: string;
  filters: SearchFilters;
  alertsEnabled: boolean;
  createdAt: string;
  lastUsed: string;
  resultCount: number;
}

export interface SearchRecommendation {
  type: 'skill_based' | 'location_based' | 'budget_based' | 'category_based';
  title: string;
  description: string;
  filters: SearchFilters;
  matchReason: string;
}

export const searchService = {
  // Búsqueda principal
  async search(filters: SearchFilters): Promise<SearchResponse> {
    const params = new URLSearchParams();
    
    // Convertir filtros a query params
    if (filters.query) params.append('q', filters.query);
    if (filters.category) params.append('category', filters.category);
    if (filters.skills?.length) params.append('skills', filters.skills.join(','));
    if (filters.location?.country) params.append('location_country', filters.location.country);
    if (filters.location?.city) params.append('location_city', filters.location.city);
    if (filters.location?.latitude) params.append('lat', filters.location.latitude.toString());
    if (filters.location?.longitude) params.append('lng', filters.location.longitude.toString());
    if (filters.location?.radius) params.append('radius', filters.location.radius.toString());
    if (filters.budget?.min) params.append('budget_min', filters.budget.min.toString());
    if (filters.budget?.max) params.append('budget_max', filters.budget.max.toString());
    if (filters.budget?.type) params.append('budget_type', filters.budget.type);
    if (filters.experience) params.append('experience', filters.experience);
    if (filters.rating?.min) params.append('rating_min', filters.rating.min.toString());
    if (filters.availability) params.append('availability', filters.availability);
    if (filters.projectType) params.append('project_type', filters.projectType);
    if (filters.sortBy) params.append('sort', filters.sortBy);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    return apiClient.get(`/search?${params.toString()}`);
  },

  // Búsqueda de proyectos específicamente
  async searchProjects(filters: SearchFilters): Promise<SearchResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    return apiClient.get(`/search/projects?${params.toString()}`);
  },

  // Búsqueda de freelancers específicamente
  async searchFreelancers(filters: SearchFilters): Promise<SearchResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    return apiClient.get(`/search/freelancers?${params.toString()}`);
  },

  // Obtener sugerencias de búsqueda
  async getSearchSuggestions(query: string): Promise<string[]> {
    return apiClient.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
  },

  // Búsqueda semántica con IA
  async semanticSearch(query: string, type?: 'projects' | 'freelancers'): Promise<SearchResponse> {
    return apiClient.post('/search/semantic', { query, type });
  },

  // Obtener recomendaciones personalizadas
  async getRecommendations(userId: string, type?: 'projects' | 'freelancers'): Promise<SearchRecommendation[]> {
    return apiClient.get(`/search/recommendations/${userId}?type=${type || 'all'}`);
  },

  // Guardar búsqueda
  async saveSearch(name: string, filters: SearchFilters, alertsEnabled: boolean = false): Promise<SavedSearch> {
    return apiClient.post('/search/saved', {
      name,
      filters,
      alertsEnabled
    });
  },

  // Obtener búsquedas guardadas
  async getSavedSearches(): Promise<SavedSearch[]> {
    return apiClient.get('/search/saved');
  },

  // Actualizar búsqueda guardada
  async updateSavedSearch(searchId: string, updates: Partial<SavedSearch>): Promise<SavedSearch> {
    return apiClient.patch(`/search/saved/${searchId}`, updates);
  },

  // Eliminar búsqueda guardada
  async deleteSavedSearch(searchId: string): Promise<void> {
    return apiClient.delete(`/search/saved/${searchId}`);
  },

  // Ejecutar búsqueda guardada
  async executeSavedSearch(searchId: string): Promise<SearchResponse> {
    return apiClient.get(`/search/saved/${searchId}/execute`);
  },

  // Obtener estadísticas de búsqueda
  async getSearchStats(): Promise<{
    totalSearches: number;
    popularKeywords: Array<{ keyword: string; count: number }>;
    popularCategories: Array<{ category: string; count: number }>;
    popularSkills: Array<{ skill: string; count: number }>;
    averageResultsPerSearch: number;
  }> {
    return apiClient.get('/search/stats');
  },

  // Obtener filtros disponibles
  async getAvailableFilters(): Promise<{
    categories: Array<{ id: string; name: string; count: number; subcategories?: Array<{ id: string; name: string }> }>;
    skills: Array<{ id: string; name: string; category: string; count: number }>;
    locations: Array<{ country: string; cities: Array<{ name: string; count: number }> }>;
    experienceLevels: Array<{ id: string; name: string; description: string }>;
  }> {
    return apiClient.get('/search/filters');
  },

  // Geolocalización
  async getNearbyResults(latitude: number, longitude: number, radius: number = 50, type?: 'projects' | 'freelancers'): Promise<SearchResponse> {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
      radius: radius.toString(),
      ...(type && { type })
    });
    return apiClient.get(`/search/nearby?${params.toString()}`);
  },

  // Autocompletado de ubicaciones
  async getLocationSuggestions(query: string): Promise<Array<{
    name: string;
    country: string;
    region: string;
    latitude: number;
    longitude: number;
  }>> {
    return apiClient.get(`/search/locations?q=${encodeURIComponent(query)}`);
  },

  // Autocompletado de habilidades
  async getSkillSuggestions(query: string): Promise<Array<{
    id: string;
    name: string;
    category: string;
    synonyms: string[];
  }>> {
    return apiClient.get(`/search/skills?q=${encodeURIComponent(query)}`);
  },

  // Obtener proyectos similares
  async getSimilarProjects(projectId: string): Promise<SearchResult[]> {
    return apiClient.get(`/search/similar/projects/${projectId}`);
  },

  // Obtener freelancers similares
  async getSimilarFreelancers(freelancerId: string): Promise<SearchResult[]> {
    return apiClient.get(`/search/similar/freelancers/${freelancerId}`);
  },

  // Reportar resultado de búsqueda
  async reportSearchResult(resultId: string, reason: string): Promise<void> {
    return apiClient.post('/search/report', { resultId, reason });
  },

  // Marcar resultado como favorito
  async favoriteResult(resultId: string, type: 'project' | 'freelancer'): Promise<void> {
    return apiClient.post('/search/favorite', { resultId, type });
  },

  // Obtener favoritos
  async getFavorites(type?: 'project' | 'freelancer'): Promise<SearchResult[]> {
    return apiClient.get(`/search/favorites${type ? `?type=${type}` : ''}`);
  },

  // Historial de búsquedas
  async getSearchHistory(limit: number = 10): Promise<Array<{
    id: string;
    query: string;
    filters: SearchFilters;
    resultCount: number;
    searchedAt: string;
  }>> {
    return apiClient.get(`/search/history?limit=${limit}`);
  },

  // Limpiar historial de búsquedas
  async clearSearchHistory(): Promise<void> {
    return apiClient.delete('/search/history');
  }
};

export default searchService;