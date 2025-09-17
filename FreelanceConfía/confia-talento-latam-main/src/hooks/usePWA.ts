import { useState, useEffect, useCallback } from 'react';
import pushNotificationService, { type NotificationPermissionStatus } from '@/services/pushNotificationService';
import { useToast } from '@/hooks/use-toast';

interface PWAInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWACapabilities {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  supportsNotifications: boolean;
  supportsOffline: boolean;
  supportsBackgroundSync: boolean;
}

export const usePWA = () => {
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermissionStatus>({
    permission: 'default',
    supported: false,
    subscribed: false
  });
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const { toast } = useToast();

  // Verificar capacidades PWA
  const capabilities: PWACapabilities = {
    canInstall: !!installPrompt,
    isInstalled,
    isStandalone,
    supportsNotifications: 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window,
    supportsOffline: 'serviceWorker' in navigator && 'caches' in window,
    supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
  };

  // Inicializar PWA
  useEffect(() => {
    initializePWA();
  }, []);

  const initializePWA = async () => {
    // Detectar si está instalado/standalone
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (window.navigator as any).standalone === true
    );

    // Registrar service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        setServiceWorkerRegistration(registration);
        
        // Verificar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });

        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    // Escuchar evento de instalación
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e as PWAInstallPrompt);
    });

    // Detectar cuando se instala
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      toast({
        title: "¡App instalada!",
        description: "FreelanceConfía se ha instalado correctamente en tu dispositivo",
      });
    });

    // Escuchar cambios de conexión
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    // Verificar estado de notificaciones
    checkNotificationStatus();
  };

  const checkNotificationStatus = async () => {
    try {
      const status = await pushNotificationService.checkPermissionStatus();
      setNotificationStatus(status);
    } catch (error) {
      console.error('Error checking notification status:', error);
    }
  };

  // Instalar la PWA
  const installPWA = useCallback(async () => {
    if (!installPrompt) {
      toast({
        title: "No se puede instalar",
        description: "La instalación no está disponible en este momento",
        variant: "destructive"
      });
      return;
    }

    setIsInstalling(true);
    
    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA install accepted');
        setIsInstalled(true);
      } else {
        console.log('PWA install dismissed');
      }
      
      setInstallPrompt(null);
    } catch (error) {
      console.error('Error during PWA installation:', error);
      toast({
        title: "Error en la instalación",
        description: "No se pudo instalar la aplicación",
        variant: "destructive"
      });
    } finally {
      setIsInstalling(false);
    }
  }, [installPrompt, toast]);

  // Activar notificaciones push
  const enableNotifications = useCallback(async () => {
    try {
      const subscription = await pushNotificationService.subscribe();
      await checkNotificationStatus();
      
      toast({
        title: "Notificaciones activadas",
        description: "Recibirás notificaciones de nuevos proyectos y mensajes",
      });

      // Enviar notificación de prueba
      await pushNotificationService.sendTestNotification();
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast({
        title: "Error en notificaciones",
        description: "No se pudieron activar las notificaciones",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Desactivar notificaciones push
  const disableNotifications = useCallback(async () => {
    try {
      await pushNotificationService.unsubscribe();
      await checkNotificationStatus();
      
      toast({
        title: "Notificaciones desactivadas",
        description: "Ya no recibirás notificaciones push",
      });
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron desactivar las notificaciones",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Actualizar la aplicación
  const updateApp = useCallback(async () => {
    if (!serviceWorkerRegistration || !updateAvailable) return;

    try {
      const newWorker = serviceWorkerRegistration.waiting;
      if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            window.location.reload();
          }
        });
      }
    } catch (error) {
      console.error('Error updating app:', error);
      toast({
        title: "Error en la actualización",
        description: "No se pudo actualizar la aplicación",
        variant: "destructive"
      });
    }
  }, [serviceWorkerRegistration, updateAvailable, toast]);

  // Cachear recursos importantes
  const cacheImportantResources = useCallback(async (urls: string[]) => {
    if (!serviceWorkerRegistration) return;

    try {
      serviceWorkerRegistration.active?.postMessage({
        type: 'CACHE_URLS',
        urls
      });
    } catch (error) {
      console.error('Error caching resources:', error);
    }
  }, [serviceWorkerRegistration]);

  // Obtener uso de almacenamiento
  const getStorageUsage = useCallback(async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: estimate.quota || 0,
          percentage: estimate.quota ? Math.round(((estimate.usage || 0) / estimate.quota) * 100) : 0
        };
      }
    } catch (error) {
      console.error('Error getting storage usage:', error);
    }
    return null;
  }, []);

  // Limpiar caché
  const clearCache = useCallback(async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        
        toast({
          title: "Caché limpiado",
          description: "Se ha limpiado el caché de la aplicación",
        });
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: "Error",
        description: "No se pudo limpiar el caché",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Compartir contenido usando la API nativa
  const shareContent = useCallback(async (data: {
    title?: string;
    text?: string;
    url?: string;
    files?: File[];
  }) => {
    try {
      if (navigator.share) {
        await navigator.share(data);
        return true;
      }
      
      // Fallback: copiar URL al portapapeles
      if (data.url && navigator.clipboard) {
        await navigator.clipboard.writeText(data.url);
        toast({
          title: "Enlace copiado",
          description: "El enlace se ha copiado al portapapeles",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error sharing content:', error);
      return false;
    }
  }, [toast]);

  // Verificar si hay actualizaciones disponibles
  const checkForUpdates = useCallback(async () => {
    if (!serviceWorkerRegistration) return;

    try {
      await serviceWorkerRegistration.update();
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }, [serviceWorkerRegistration]);

  return {
    // Estado
    capabilities,
    isOnline,
    isInstalling,
    updateAvailable,
    notificationStatus,
    serviceWorkerRegistration,

    // Acciones
    installPWA,
    enableNotifications,
    disableNotifications,
    updateApp,
    cacheImportantResources,
    getStorageUsage,
    clearCache,
    shareContent,
    checkForUpdates,
    checkNotificationStatus
  };
};