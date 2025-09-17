import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';

const PWAInstallBanner: React.FC = () => {
  const { capabilities, isInstalling, installPWA } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Mostrar el banner si se puede instalar y no está ya instalada
    if (capabilities.canInstall && !capabilities.isStandalone) {
      const hasBeenDismissed = localStorage.getItem('pwa-install-banner-dismissed');
      const lastDismissed = hasBeenDismissed ? new Date(hasBeenDismissed) : null;
      const now = new Date();
      
      // Mostrar si nunca se ha descartado o si han pasado más de 7 días
      if (!lastDismissed || (now.getTime() - lastDismissed.getTime()) > 7 * 24 * 60 * 60 * 1000) {
        setIsVisible(true);
      }
    }
  }, [capabilities.canInstall, capabilities.isStandalone]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-install-banner-dismissed', new Date().toISOString());
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleInstall = async () => {
    try {
      await installPWA();
      setIsVisible(false);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  if (!isVisible || capabilities.isStandalone) {
    return null;
  }

  return (
    <>
      {/* Banner completo */}
      {!isMinimized && (
        <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 shadow-lg">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">¡Instala FreelanceConfía!</h3>
                  <p className="text-xs text-gray-600">Mejor experiencia móvil</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleMinimize}
                >
                  -
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleDismiss}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Beneficios */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Acceso rápido desde tu pantalla de inicio</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Funciona sin conexión a internet</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Notificaciones push en tiempo real</span>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 h-8 text-xs"
                size="sm"
              >
                <Download className="h-3 w-3 mr-1" />
                {isInstalling ? 'Instalando...' : 'Instalar'}
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="h-8 text-xs"
                size="sm"
              >
                Más tarde
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Banner minimizado */}
      {isMinimized && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setIsMinimized(false)}
            className="rounded-full h-12 w-12 p-0 shadow-lg"
            size="sm"
          >
            <Smartphone className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  );
};

export default PWAInstallBanner;