import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Bell, 
  Download, 
  Wifi, 
  WifiOff, 
  RotateCcw, 
  HardDrive, 
  Share2, 
  Trash2,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePWA } from '@/hooks/usePWA';
import pushNotificationService from '@/services/pushNotificationService';
import { useToast } from '@/hooks/use-toast';

const PWASettings: React.FC = () => {
  const {
    capabilities,
    isOnline,
    isInstalling,
    updateAvailable,
    notificationStatus,
    installPWA,
    enableNotifications,
    disableNotifications,
    updateApp,
    getStorageUsage,
    clearCache,
    shareContent,
    checkForUpdates
  } = usePWA();

  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [notificationPreferences, setNotificationPreferences] = useState<any>({
    newProjects: true,
    newMessages: true,
    projectUpdates: true,
    payments: true,
    marketing: false,
    security: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    weekends: true
  });

  const { toast } = useToast();

  useEffect(() => {
    loadStorageInfo();
    loadNotificationPreferences();
  }, []);

  const loadStorageInfo = async () => {
    const info = await getStorageUsage();
    setStorageInfo(info);
  };

  const loadNotificationPreferences = async () => {
    try {
      const prefs = await pushNotificationService.getNotificationPreferences();
      setNotificationPreferences(prefs);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const updateNotificationPreferences = async (newPrefs: any) => {
    try {
      await pushNotificationService.updateNotificationPreferences(newPrefs);
      setNotificationPreferences(newPrefs);
      toast({
        title: "Preferencias actualizadas",
        description: "Tus preferencias de notificación se han guardado",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar las preferencias",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    const shared = await shareContent({
      title: 'FreelanceConfía',
      text: 'Descubre la mejor plataforma de freelancers en América Latina',
      url: window.location.origin
    });

    if (!shared) {
      toast({
        title: "Compartir no disponible",
        description: "Tu navegador no soporta la función de compartir nativa",
        variant: "destructive"
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConnectionIcon = () => {
    return isOnline ? (
      <div className="flex items-center gap-2 text-green-600">
        <Wifi className="h-4 w-4" />
        <span>En línea</span>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-red-600">
        <WifiOff className="h-4 w-4" />
        <span>Sin conexión</span>
      </div>
    );
  };

  const getNotificationStatusIcon = () => {
    switch (notificationStatus.permission) {
      case 'granted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'denied':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración PWA</h1>
          <p className="text-gray-600">Gestiona la aplicación móvil y notificaciones</p>
        </div>
        <div className="flex items-center gap-2">
          {getConnectionIcon()}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Instalación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={capabilities.isStandalone ? "default" : "outline"}>
              {capabilities.isStandalone ? "Instalada" : "No instalada"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getNotificationStatusIcon()}
              <Badge variant={notificationStatus.subscribed ? "default" : "outline"}>
                {notificationStatus.subscribed ? "Activas" : "Inactivas"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Almacenamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {storageInfo ? (
              <div>
                <div className="text-sm font-medium">
                  {formatBytes(storageInfo.used)}
                </div>
                <div className="text-xs text-gray-500">
                  de {formatBytes(storageInfo.available)}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Calculando...</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Actualizaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={updateAvailable ? "destructive" : "default"}>
              {updateAvailable ? "Disponible" : "Al día"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Update Alert */}
      {updateAvailable && (
        <Alert>
          <RotateCcw className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Hay una nueva versión disponible</span>
            <Button size="sm" onClick={updateApp}>
              Actualizar ahora
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="installation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="installation">Instalación</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="storage">Almacenamiento</TabsTrigger>
          <TabsTrigger value="features">Funciones</TabsTrigger>
        </TabsList>

        <TabsContent value="installation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Instalar Aplicación
              </CardTitle>
              <CardDescription>
                Instala FreelanceConfía en tu dispositivo para una mejor experiencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Beneficios de la instalación:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Acceso rápido desde tu pantalla de inicio</li>
                    <li>• Funciona sin conexión a internet</li>
                    <li>• Notificaciones push en tiempo real</li>
                    <li>• Mejor rendimiento y velocidad</li>
                    <li>• Experiencia de aplicación nativa</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">¿Puede instalarse?</span>
                    <Badge variant={capabilities.canInstall ? "default" : "outline"}>
                      {capabilities.canInstall ? "Sí" : "No"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">¿Está instalada?</span>
                    <Badge variant={capabilities.isStandalone ? "default" : "outline"}>
                      {capabilities.isStandalone ? "Sí" : "No"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Soporte offline</span>
                    <Badge variant={capabilities.supportsOffline ? "default" : "outline"}>
                      {capabilities.supportsOffline ? "Sí" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button
                  onClick={installPWA}
                  disabled={!capabilities.canInstall || isInstalling || capabilities.isStandalone}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isInstalling ? 'Instalando...' : 'Instalar App'}
                </Button>
                
                <Button variant="outline" onClick={checkForUpdates}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Buscar actualizaciones
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuración de Notificaciones
              </CardTitle>
              <CardDescription>
                Personaliza qué notificaciones quieres recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Estado actual */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getNotificationStatusIcon()}
                  <div>
                    <div className="font-medium">
                      Estado: {notificationStatus.permission === 'granted' ? 'Habilitadas' : 
                              notificationStatus.permission === 'denied' ? 'Bloqueadas' : 'Pendientes'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {notificationStatus.subscribed ? 'Suscrito a notificaciones push' : 'No suscrito'}
                    </div>
                  </div>
                </div>
                
                {notificationStatus.permission === 'granted' && !notificationStatus.subscribed && (
                  <Button onClick={enableNotifications}>
                    Activar notificaciones
                  </Button>
                )}
                
                {notificationStatus.subscribed && (
                  <Button variant="outline" onClick={disableNotifications}>
                    Desactivar
                  </Button>
                )}
              </div>

              {/* Preferencias */}
              {notificationStatus.permission === 'granted' && (
                <div className="space-y-4">
                  <h4 className="font-medium">Tipos de notificaciones:</h4>
                  
                  <div className="space-y-3">
                    {[
                      { key: 'newProjects', label: 'Nuevos proyectos', description: 'Cuando se publiquen proyectos que coincidan con tus habilidades' },
                      { key: 'newMessages', label: 'Nuevos mensajes', description: 'Mensajes de clientes y actualizaciones de chat' },
                      { key: 'projectUpdates', label: 'Actualizaciones de proyectos', description: 'Cambios en tus proyectos activos' },
                      { key: 'payments', label: 'Pagos', description: 'Confirmaciones de pago y transacciones' },
                      { key: 'security', label: 'Seguridad', description: 'Alertas de seguridad y accesos' },
                      { key: 'marketing', label: 'Marketing', description: 'Promociones y novedades de la plataforma' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-sm text-gray-600">{item.description}</div>
                        </div>
                        <Switch
                          checked={notificationPreferences[item.key]}
                          onCheckedChange={(checked) => {
                            const newPrefs = { ...notificationPreferences, [item.key]: checked };
                            updateNotificationPreferences(newPrefs);
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Horarios silenciosos */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Horario silencioso</div>
                        <div className="text-sm text-gray-600">No recibir notificaciones en ciertos horarios</div>
                      </div>
                      <Switch
                        checked={notificationPreferences.quietHours?.enabled}
                        onCheckedChange={(checked) => {
                          const newPrefs = {
                            ...notificationPreferences,
                            quietHours: { ...notificationPreferences.quietHours, enabled: checked }
                          };
                          updateNotificationPreferences(newPrefs);
                        }}
                      />
                    </div>

                    {notificationPreferences.quietHours?.enabled && (
                      <div className="grid grid-cols-2 gap-4 ml-6">
                        <div>
                          <Label htmlFor="start-time">Desde</Label>
                          <Select
                            value={notificationPreferences.quietHours.start}
                            onValueChange={(value) => {
                              const newPrefs = {
                                ...notificationPreferences,
                                quietHours: { ...notificationPreferences.quietHours, start: value }
                              };
                              updateNotificationPreferences(newPrefs);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => {
                                const hour = i.toString().padStart(2, '0');
                                return (
                                  <SelectItem key={hour} value={`${hour}:00`}>
                                    {hour}:00
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="end-time">Hasta</Label>
                          <Select
                            value={notificationPreferences.quietHours.end}
                            onValueChange={(value) => {
                              const newPrefs = {
                                ...notificationPreferences,
                                quietHours: { ...notificationPreferences.quietHours, end: value }
                              };
                              updateNotificationPreferences(newPrefs);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => {
                                const hour = i.toString().padStart(2, '0');
                                return (
                                  <SelectItem key={hour} value={`${hour}:00`}>
                                    {hour}:00
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Notificaciones en fines de semana</div>
                        <div className="text-sm text-gray-600">Recibir notificaciones sábados y domingos</div>
                      </div>
                      <Switch
                        checked={notificationPreferences.weekends}
                        onCheckedChange={(checked) => {
                          const newPrefs = { ...notificationPreferences, weekends: checked };
                          updateNotificationPreferences(newPrefs);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Gestión de Almacenamiento
              </CardTitle>
              <CardDescription>
                Administra el espacio usado por la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {storageInfo && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usado: {formatBytes(storageInfo.used)}</span>
                      <span>Disponible: {formatBytes(storageInfo.available)}</span>
                    </div>
                    <Progress value={storageInfo.percentage} className="w-full" />
                    <div className="text-center text-sm text-gray-600">
                      {storageInfo.percentage}% usado
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium">Gestión de caché:</h4>
                    <p className="text-sm text-gray-600">
                      La aplicación guarda datos para funcionar sin conexión. Puedes limpiar el caché 
                      si necesitas liberar espacio.
                    </p>
                    <Button variant="outline" onClick={clearCache} className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Limpiar caché
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Funciones Adicionales
              </CardTitle>
              <CardDescription>
                Características especiales de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Funciones disponibles:</h4>
                  
                  <div className="space-y-2">
                    {[
                      { feature: 'Modo offline', supported: capabilities.supportsOffline, icon: Wifi },
                      { feature: 'Notificaciones push', supported: capabilities.supportsNotifications, icon: Bell },
                      { feature: 'Sincronización en background', supported: capabilities.supportsBackgroundSync, icon: RotateCcw },
                      { feature: 'Compartir nativo', supported: 'share' in navigator, icon: Share2 }
                    ].map((item) => (
                      <div key={item.feature} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.feature}</span>
                        </div>
                        <Badge variant={item.supported ? "default" : "outline"}>
                          {item.supported ? "Disponible" : "No disponible"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Acciones rápidas:</h4>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      onClick={handleShare}
                      className="w-full flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Compartir aplicación
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => loadStorageInfo()}
                      className="w-full flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Actualizar información
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PWASettings;