import React from 'react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  MousePointer, 
  Type, 
  Volume2, 
  Keyboard, 
  Palette,
  RotateCcw,
  Shield,
  CheckCircle
} from 'lucide-react';

interface AccessibilityPanelProps {
  className?: string;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ className }) => {
  const { 
    settings, 
    updateSetting, 
    resetSettings, 
    announceToScreenReader 
  } = useAccessibility();

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    updateSetting(key, value);
    announceToScreenReader(
      value 
        ? `${getSettingLabel(key)} activado` 
        : `${getSettingLabel(key)} desactivado`
    );
  };

  const getSettingLabel = (key: keyof typeof settings): string => {
    const labels = {
      highContrast: 'Alto contraste',
      reducedMotion: 'Movimiento reducido',
      largeText: 'Texto grande',
      screenReader: 'Lector de pantalla',
      keyboardNavigation: 'Navegación por teclado',
      colorBlindFriendly: 'Amigable para daltonismo'
    };
    return labels[key];
  };

  const getActiveCount = () => {
    return Object.values(settings).filter(Boolean).length;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Configuración de Accesibilidad
            </CardTitle>
            <CardDescription>
              Personaliza la interfaz para una mejor experiencia de usuario
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {getActiveCount()} activos
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Visual Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Configuración Visual
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="high-contrast" className="text-base">
                  Alto Contraste
                </Label>
                <p className="text-sm text-muted-foreground">
                  Aumenta el contraste para mejor visibilidad
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
                aria-describedby="high-contrast-desc"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="large-text" className="text-base">
                  Texto Grande
                </Label>
                <p className="text-sm text-muted-foreground">
                  Incrementa el tamaño de fuente para mejor legibilidad
                </p>
              </div>
              <Switch
                id="large-text"
                checked={settings.largeText}
                onCheckedChange={(checked) => handleSettingChange('largeText', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="color-blind-friendly" className="text-base">
                  <Palette className="h-4 w-4 inline mr-1" />
                  Amigable para Daltonismo
                </Label>
                <p className="text-sm text-muted-foreground">
                  Usa patrones y formas además de colores
                </p>
              </div>
              <Switch
                id="color-blind-friendly"
                checked={settings.colorBlindFriendly}
                onCheckedChange={(checked) => handleSettingChange('colorBlindFriendly', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Motion Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            Configuración de Movimiento
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion" className="text-base">
                Movimiento Reducido
              </Label>
              <p className="text-sm text-muted-foreground">
                Minimiza animaciones y transiciones
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
            />
          </div>
        </div>

        <Separator />

        {/* Navigation Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Configuración de Navegación
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="keyboard-navigation" className="text-base">
                  Navegación por Teclado
                </Label>
                <p className="text-sm text-muted-foreground">
                  Resalta elementos enfocados con el teclado
                </p>
              </div>
              <Switch
                id="keyboard-navigation"
                checked={settings.keyboardNavigation}
                onCheckedChange={(checked) => handleSettingChange('keyboardNavigation', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="screen-reader" className="text-base">
                  <Volume2 className="h-4 w-4 inline mr-1" />
                  Lector de Pantalla
                </Label>
                <p className="text-sm text-muted-foreground">
                  Optimiza para lectores de pantalla
                </p>
              </div>
              <Switch
                id="screen-reader"
                checked={settings.screenReader}
                onCheckedChange={(checked) => handleSettingChange('screenReader', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              ¿Necesitas ayuda? Consulta nuestra{' '}
              <a 
                href="/docs/accesibilidad" 
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                guía de accesibilidad
              </a>
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetSettings();
              announceToScreenReader('Configuración de accesibilidad restablecida');
            }}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restablecer
          </Button>
        </div>

        {/* Accessibility Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">
                Estado de Accesibilidad
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                FreelanceConfía cumple con las pautas WCAG 2.1 AA para garantizar 
                una experiencia accesible para todos los usuarios.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  WCAG 2.1 AA
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Section 508
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  ADA Compliant
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};