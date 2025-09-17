import React, { useState, useEffect } from 'react';
import { Shield, Activity, AlertTriangle, Settings, Lock, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import IdentityVerification from '@/components/security/IdentityVerification';
import TwoFactorAuth from '@/components/security/TwoFactorAuth';
import securityService from '@/services/securityService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SecuritySettings = () => {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    identityVerified: false,
    paymentVerified: false,
    loginAlerts: true,
    transactionAlerts: true,
    securityLevel: 'standard' as 'basic' | 'standard' | 'high'
  });
  
  const [verificationStatus, setVerificationStatus] = useState<{
    identity: any;
    payment: any;
    overall: 'unverified' | 'partial' | 'verified';
  } | null>(null);

  const [securityActivity, setSecurityActivity] = useState<{
    recentLogins: Array<{
      timestamp: string;
      ipAddress: string;
      location: string;
      device: string;
      suspicious: boolean;
    }>;
    verificationHistory: any[];
    securityAlerts: Array<{
      type: string;
      message: string;
      timestamp: string;
      resolved: boolean;
    }>;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setIsLoading(true);
    try {
      const [settings, verification, activity] = await Promise.all([
        securityService.getSecuritySettings(),
        securityService.getVerificationStatus(),
        securityService.getSecurityActivity()
      ]);

      setSecuritySettings(settings);
      setVerificationStatus(verification);
      setSecurityActivity(activity);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración de seguridad",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSecuritySetting = async (setting: string, value: boolean | string) => {
    try {
      await securityService.updateSecuritySettings({ [setting]: value });
      setSecuritySettings(prev => ({ ...prev, [setting]: value }));
      toast({
        title: "Configuración actualizada",
        description: "La configuración de seguridad ha sido guardada",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive"
      });
    }
  };

  const getSecurityLevelBadge = () => {
    const level = securitySettings.securityLevel;
    const colors = {
      basic: 'bg-yellow-100 text-yellow-800',
      standard: 'bg-blue-100 text-blue-800',
      high: 'bg-green-100 text-green-800'
    };

    return (
      <Badge className={colors[level]}>
        {level === 'basic' ? 'Básico' : level === 'standard' ? 'Estándar' : 'Alto'}
      </Badge>
    );
  };

  const getOverallSecurityScore = () => {
    let score = 0;
    if (securitySettings.twoFactorEnabled) score += 30;
    if (securitySettings.identityVerified) score += 25;
    if (securitySettings.paymentVerified) score += 25;
    if (securitySettings.securityLevel === 'high') score += 20;
    return Math.min(score, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Cargando configuración de seguridad...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configuración de Seguridad
            </h1>
            <p className="text-gray-600">
              Gestiona la seguridad de tu cuenta y protege tu información
            </p>
          </div>

          {/* Security Score */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Puntuación de Seguridad
                </span>
                {getSecurityLevelBadge()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Seguridad de la cuenta</span>
                    <span>{getOverallSecurityScore()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        getOverallSecurityScore() >= 80 ? 'bg-green-500' :
                        getOverallSecurityScore() >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${getOverallSecurityScore()}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {getOverallSecurityScore() >= 80 
                      ? 'Excelente nivel de seguridad' 
                      : getOverallSecurityScore() >= 60 
                      ? 'Buen nivel de seguridad, considera mejoras'
                      : 'Nivel de seguridad bajo, se recomienda activar más protecciones'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="verification" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="verification">Verificación</TabsTrigger>
              <TabsTrigger value="authentication">Autenticación</TabsTrigger>
              <TabsTrigger value="preferences">Preferencias</TabsTrigger>
              <TabsTrigger value="activity">Actividad</TabsTrigger>
            </TabsList>

            {/* Verification Tab */}
            <TabsContent value="verification" className="space-y-6">
              <IdentityVerification
                verificationStatus={verificationStatus?.identity?.status}
                onVerificationSubmitted={loadSecurityData}
              />

              {/* Payment Verification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Verificación de Pagos
                    </span>
                    {securitySettings.paymentVerified ? (
                      <Badge className="bg-green-100 text-green-800">Verificado</Badge>
                    ) : (
                      <Badge variant="outline">No verificado</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Verifica tus métodos de pago para transacciones seguras
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {securitySettings.paymentVerified ? (
                    <Alert className="border-green-200 bg-green-50">
                      <Shield className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600">
                        Tus métodos de pago han sido verificados correctamente.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Verifica tus métodos de pago para poder recibir pagos y realizar retiros.
                        </AlertDescription>
                      </Alert>
                      <Button>
                        Verificar Métodos de Pago
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Authentication Tab */}
            <TabsContent value="authentication" className="space-y-6">
              <TwoFactorAuth
                isEnabled={securitySettings.twoFactorEnabled}
                onStatusChange={(enabled) => 
                  setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: enabled }))
                }
              />

              {/* Password Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Contraseña
                  </CardTitle>
                  <CardDescription>
                    Mantén tu contraseña segura y actualizada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Cambiar contraseña</p>
                        <p className="text-sm text-gray-600">
                          Última actualización: hace 3 meses
                        </p>
                      </div>
                      <Button variant="outline">
                        Cambiar Contraseña
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Alertas de Seguridad
                  </CardTitle>
                  <CardDescription>
                    Configura cuándo quieres recibir notificaciones de seguridad
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="loginAlerts">Alertas de inicio de sesión</Label>
                      <p className="text-sm text-gray-600">
                        Recibe notificaciones cuando alguien inicie sesión en tu cuenta
                      </p>
                    </div>
                    <Switch
                      id="loginAlerts"
                      checked={securitySettings.loginAlerts}
                      onCheckedChange={(checked) => updateSecuritySetting('loginAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="transactionAlerts">Alertas de transacciones</Label>
                      <p className="text-sm text-gray-600">
                        Recibe notificaciones de todos los movimientos de dinero
                      </p>
                    </div>
                    <Switch
                      id="transactionAlerts"
                      checked={securitySettings.transactionAlerts}
                      onCheckedChange={(checked) => updateSecuritySetting('transactionAlerts', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nivel de Seguridad</CardTitle>
                  <CardDescription>
                    Ajusta el nivel de seguridad según tus necesidades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { value: 'basic', label: 'Básico', description: 'Protección mínima requerida' },
                      { value: 'standard', label: 'Estándar', description: 'Balance entre seguridad y conveniencia' },
                      { value: 'high', label: 'Alto', description: 'Máxima seguridad para transacciones importantes' }
                    ].map((level) => (
                      <div key={level.value} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id={level.value}
                          name="securityLevel"
                          checked={securitySettings.securityLevel === level.value}
                          onChange={() => updateSecuritySetting('securityLevel', level.value)}
                          className="h-4 w-4 text-primary"
                        />
                        <div className="flex-1">
                          <Label htmlFor={level.value} className="font-medium">
                            {level.label}
                          </Label>
                          <p className="text-sm text-gray-600">{level.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Actividad Reciente
                  </CardTitle>
                  <CardDescription>
                    Revisa la actividad reciente en tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="font-medium">Inicios de sesión recientes</h4>
                    {securityActivity?.recentLogins.map((login, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{login.location}</p>
                          <p className="text-sm text-gray-600">
                            {login.device} • {login.ipAddress}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(login.timestamp)}
                          </p>
                        </div>
                        {login.suspicious && (
                          <Badge variant="destructive">Sospechoso</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {securityActivity?.securityAlerts && securityActivity.securityAlerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Alertas de Seguridad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {securityActivity.securityAlerts.map((alert, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">{alert.type}</p>
                            <p className="text-sm text-gray-600">{alert.message}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(alert.timestamp)}
                            </p>
                          </div>
                          {alert.resolved && (
                            <Badge className="bg-green-100 text-green-800">Resuelto</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SecuritySettings;