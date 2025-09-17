import { apiClient } from '@/lib/api';
import { Notification } from '@/contexts/NotificationContext';

export interface CreateNotificationData {
  type: 'project' | 'application' | 'message' | 'payment' | 'system';
  title: string;
  message: string;
  userId: string;
  data?: {
    projectId?: string;
    applicationId?: string;
    messageId?: string;
    paymentId?: string;
    [key: string]: any;
  };
}

export const notificationService = {
  // Obtener todas las notificaciones del usuario
  async getNotifications(): Promise<Notification[]> {
    return apiClient.get('/notifications');
  },

  // Crear una nueva notificación
  async createNotification(notificationData: CreateNotificationData): Promise<Notification> {
    return apiClient.post('/notifications', notificationData);
  },

  // Marcar notificación como leída
  async markAsRead(notificationId: string): Promise<void> {
    return apiClient.patch(`/notifications/${notificationId}/read`);
  },

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(): Promise<void> {
    return apiClient.patch('/notifications/mark-all-read');
  },

  // Eliminar una notificación
  async deleteNotification(notificationId: string): Promise<void> {
    return apiClient.delete(`/notifications/${notificationId}`);
  },

  // Limpiar todas las notificaciones
  async clearAllNotifications(): Promise<void> {
    return apiClient.delete('/notifications');
  },

  // Obtener notificaciones no leídas
  async getUnreadNotifications(): Promise<Notification[]> {
    return apiClient.get('/notifications/unread');
  },

  // Obtener estadísticas de notificaciones
  async getNotificationStats(): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
  }> {
    return apiClient.get('/notifications/stats');
  },

  // Configurar preferencias de notificaciones
  async updateNotificationPreferences(preferences: {
    email: boolean;
    push: boolean;
    projects: boolean;
    applications: boolean;
    messages: boolean;
    payments: boolean;
    marketing: boolean;
  }): Promise<void> {
    return apiClient.patch('/notifications/preferences', preferences);
  },

  // Obtener preferencias de notificaciones
  async getNotificationPreferences(): Promise<{
    email: boolean;
    push: boolean;
    projects: boolean;
    applications: boolean;
    messages: boolean;
    payments: boolean;
    marketing: boolean;
  }> {
    return apiClient.get('/notifications/preferences');
  }
};

export default notificationService;