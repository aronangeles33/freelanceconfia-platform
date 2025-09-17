import { apiClient } from '@/lib/api';

// Interfaces para notificaciones push
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  timestamp?: number;
}

export interface NotificationPermissionStatus {
  permission: NotificationPermission;
  supported: boolean;
  subscribed: boolean;
  subscription?: PushSubscription;
}

export const pushNotificationService = {
  // Verificar soporte y permisos
  async checkPermissionStatus(): Promise<NotificationPermissionStatus> {
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    
    if (!supported) {
      return {
        permission: 'denied',
        supported: false,
        subscribed: false
      };
    }

    const permission = Notification.permission;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      return {
        permission,
        supported: true,
        subscribed: !!subscription,
        subscription: subscription ? {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(subscription.getKey('auth')!)
          }
        } : undefined
      };
    } catch (error) {
      console.error('Error checking push subscription:', error);
      return {
        permission,
        supported: true,
        subscribed: false
      };
    }
  },

  // Solicitar permisos de notificación
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Este navegador no soporta notificaciones');
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return permission;
  },

  // Obtener la clave pública VAPID desde el servidor
  async getVapidPublicKey(): Promise<string> {
    try {
      const response: any = await apiClient.get('/notifications/vapid-public-key');
      return response.publicKey;
    } catch (error) {
      console.error('Error getting VAPID key:', error);
      // Fallback key para desarrollo
      return 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NPlj-xm-y-q7V_Xm-wNHo6g6bhGJBHBMk1FJL3fWyc2_2fHN_ew0eM';
    }
  },

  // Suscribirse a notificaciones push
  async subscribe(): Promise<PushSubscription> {
    const permission = await this.requestPermission();
    
    if (permission !== 'granted') {
      throw new Error(`Permisos de notificación denegados: ${permission}`);
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = await this.getVapidPublicKey();
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource
      });

      const subscriptionData: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      // Enviar suscripción al servidor
      await apiClient.post('/notifications/subscribe', subscriptionData);

      return subscriptionData;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw new Error('No se pudo suscribir a las notificaciones');
    }
  },

  // Desuscribirse de notificaciones push
  async unsubscribe(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notificar al servidor
        await apiClient.post('/notifications/unsubscribe', {
          endpoint: subscription.endpoint
        });
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw new Error('No se pudo desuscribir de las notificaciones');
    }
  },

  // Enviar notificación de prueba
  async sendTestNotification(): Promise<void> {
    try {
      await apiClient.post('/notifications/test');
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw new Error('No se pudo enviar la notificación de prueba');
    }
  },

  // Configurar preferencias de notificación
  async updateNotificationPreferences(preferences: {
    newProjects?: boolean;
    newMessages?: boolean;
    projectUpdates?: boolean;
    payments?: boolean;
    marketing?: boolean;
    security?: boolean;
    quietHours?: {
      enabled: boolean;
      start: string; // HH:mm format
      end: string;   // HH:mm format
    };
    weekends?: boolean;
  }): Promise<void> {
    try {
      await apiClient.patch('/notifications/preferences', preferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw new Error('No se pudieron actualizar las preferencias');
    }
  },

  // Obtener preferencias de notificación
  async getNotificationPreferences(): Promise<any> {
    try {
      return await apiClient.get('/notifications/preferences');
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      throw new Error('No se pudieron obtener las preferencias');
    }
  },

  // Mostrar notificación local
  async showLocalNotification(data: PushNotificationData): Promise<void> {
    const permission = await this.requestPermission();
    
    if (permission !== 'granted') {
      throw new Error('Permisos de notificación denegados');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/badge-72x72.png',
        data: data.data || {},
        actions: data.actions || [],
        tag: data.tag || 'general',
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        vibrate: data.vibrate || [200, 100, 200],
        timestamp: data.timestamp || Date.now(),
        dir: 'ltr',
        lang: 'es'
      } as NotificationOptions);
    } catch (error) {
      console.error('Error showing local notification:', error);
      throw new Error('No se pudo mostrar la notificación');
    }
  },

  // Limpiar notificaciones
  async clearNotifications(tag?: string): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications(tag ? { tag } : {});
      
      notifications.forEach(notification => notification.close());
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  },

  // Obtener notificaciones activas
  async getActiveNotifications(): Promise<Notification[]> {
    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.getNotifications();
    } catch (error) {
      console.error('Error getting active notifications:', error);
      return [];
    }
  },

  // Verificar si el usuario está en modo "No molestar"
  isQuietHours(preferences: any): boolean {
    if (!preferences?.quietHours?.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const isWeekend = [0, 6].includes(now.getDay());

    if (!preferences.weekends && isWeekend) {
      return true;
    }

    const { start, end } = preferences.quietHours;
    
    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      // Horario que cruza medianoche
      return currentTime >= start || currentTime <= end;
    }
  },

  // Configurar badge de la aplicación (número en el ícono)
  async setBadge(count: number): Promise<void> {
    try {
      if ('setAppBadge' in navigator) {
        await (navigator as any).setAppBadge(count);
      }
    } catch (error) {
      console.error('Error setting app badge:', error);
    }
  },

  // Limpiar badge de la aplicación
  async clearBadge(): Promise<void> {
    try {
      if ('clearAppBadge' in navigator) {
        await (navigator as any).clearAppBadge();
      }
    } catch (error) {
      console.error('Error clearing app badge:', error);
    }
  },

  // Manejar clics en notificaciones (desde el service worker)
  // Nota: Este método debe ser llamado desde el service worker, no desde la aplicación
  handleNotificationClick(event: any): void {
    // Este método es solo documentación de cómo manejar clicks en el SW
    // La implementación real está en public/sw.js
    console.log('Notification click handler - should be implemented in service worker');
  }
};

// Funciones utilitarias
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export default pushNotificationService;