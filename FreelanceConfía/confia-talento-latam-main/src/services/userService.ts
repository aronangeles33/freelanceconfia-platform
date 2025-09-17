import { apiClient, type User } from '@/lib/api';

// Servicio de usuarios
export const userService = {
  // Obtener perfil de usuario
  async getProfile(): Promise<User> {
    return apiClient.get('/user/profile');
  },

  // Actualizar perfil de usuario
  async updateProfile(updates: Partial<User>): Promise<User> {
    return apiClient.put('/user/profile', updates);
  },

  // Obtener usuarios (freelancers o empresas)
  async getUsers(filters?: {
    userType?: 'freelancer' | 'company';
    skills?: string[];
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    users: User[];
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
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    return apiClient.get(endpoint);
  },

  // Obtener usuario por ID
  async getUser(id: string): Promise<User> {
    return apiClient.get(`/users/${id}`);
  }
};