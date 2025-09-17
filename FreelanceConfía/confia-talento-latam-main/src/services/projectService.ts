import { apiClient, type Project } from '@/lib/api';

// Interfaz para filtros de proyectos
export interface ProjectFilters {
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  skills?: string[];
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Interfaz para crear proyecto
export interface CreateProjectData {
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: number;
  budgetType: 'fixed' | 'hourly';
  duration: string;
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  projectType: 'simple' | 'complex';
}

// Interfaz para aplicar a proyecto
export interface ApplicationData {
  message: string;
  proposedBudget: number;
  estimatedDays: number;
  portfolio?: string;
}

// Servicio de proyectos
export const projectService = {
  // Obtener todos los proyectos con filtros
  async getProjects(filters?: ProjectFilters): Promise<{
    projects: Project[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/projects?${queryString}` : '/projects';
    
    return apiClient.get(endpoint);
  },

  // Obtener un proyecto por ID
  async getProject(id: string): Promise<Project> {
    return apiClient.get(`/projects/${id}`);
  },

  // Crear un nuevo proyecto
  async createProject(projectData: CreateProjectData): Promise<Project> {
    return apiClient.post('/projects', projectData);
  },

  // Actualizar un proyecto
  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    return apiClient.put(`/projects/${id}`, updates);
  },

  // Eliminar un proyecto
  async deleteProject(id: string): Promise<void> {
    return apiClient.delete(`/projects/${id}`);
  },

  // Obtener mis proyectos
  async getMyProjects(): Promise<Project[]> {
    return apiClient.get('/projects/my');
  },

  // Aplicar a un proyecto
  async applyToProject(projectId: string, applicationData: ApplicationData): Promise<any> {
    return apiClient.post(`/projects/${projectId}/apply`, applicationData);
  },

  // Obtener aplicaciones de un proyecto
  async getProjectApplications(projectId: string): Promise<any[]> {
    return apiClient.get(`/projects/${projectId}/applications`);
  },

  // Obtener mis aplicaciones
  async getMyApplications(): Promise<any[]> {
    return apiClient.get('/applications/my');
  },

  // Actualizar estado de aplicación
  async updateApplicationStatus(applicationId: string, status: 'accepted' | 'rejected'): Promise<any> {
    return apiClient.patch(`/applications/${applicationId}/status`, { status });
  },

  // Obtener proyectos similares
  async getSimilarProjects(projectId: string, limit: number = 3): Promise<Project[]> {
    return apiClient.get(`/projects/${projectId}/similar?limit=${limit}`);
  },

  // Obtener categorías disponibles
  async getCategories(): Promise<{
    categories: Array<{
      name: string;
      count: number;
      averageBudget: number;
      topSkills: string[];
    }>;
  }> {
    return apiClient.get('/projects/categories');
  },

  // Buscar proyectos con filtros avanzados
  async searchProjects(filters: {
    search?: string;
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    budgetType?: 'fixed' | 'hourly';
    skills?: string[];
    experienceLevel?: string;
    duration?: string;
    sortBy?: 'newest' | 'budget_asc' | 'budget_desc' | 'deadline';
    page?: number;
    limit?: number;
  }): Promise<{
    projects: Project[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return apiClient.post('/projects/search', filters);
  },

  // Finalizar proyecto
  async completeProject(projectId: string): Promise<any> {
    return apiClient.patch(`/projects/${projectId}/complete`);
  },

  // Cancelar proyecto
  async cancelProject(projectId: string, reason: string): Promise<any> {
    return apiClient.patch(`/projects/${projectId}/cancel`, { reason });
  }
};