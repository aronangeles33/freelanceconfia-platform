import React from 'react';
import { AccessibilityPanel } from '@/components/ui/accessibility-panel';
import { EnhancedCard } from '@/components/ui/micro-interactions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Heart, 
  Users, 
  Globe, 
  CheckCircle, 
  ArrowLeft,
  ExternalLink 
} from 'lucide-react';

const AccessibilitySettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Configuración
        </Button>
        
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Configuración de Accesibilidad</h1>
            <p className="text-muted-foreground">
              Personaliza FreelanceConfía para una experiencia óptima
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            WCAG 2.1 AA
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Section 508
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            ADA Compliant
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Panel */}
        <div className="lg:col-span-2">
          <AccessibilityPanel />
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Accessibility Commitment */}
          <EnhancedCard hoverEffect="lift">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="h-6 w-6 text-red-500" />
                <h3 className="text-lg font-semibold">Nuestro Compromiso</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                En FreelanceConfía creemos que la tecnología debe ser accesible para todos. 
                Trabajamos continuamente para mejorar la experiencia de usuarios con discapacidades.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Soporte para lectores de pantalla</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Navegación por teclado</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Alto contraste</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Texto escalable</span>
                </div>
              </div>
            </div>
          </EnhancedCard>

          {/* Statistics */}
          <EnhancedCard hoverEffect="glow">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Impacto Social</h3>
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">15%</div>
                  <div className="text-sm text-muted-foreground">
                    de la población mundial tiene alguna discapacidad
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1.2M+</div>
                  <div className="text-sm text-muted-foreground">
                    usuarios acceden a tecnología accesible
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">98%</div>
                  <div className="text-sm text-muted-foreground">
                    mejor experiencia con diseño inclusivo
                  </div>
                </div>
              </div>
            </div>
          </EnhancedCard>

          {/* Support Links */}
          <EnhancedCard>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-6 w-6 text-indigo-600" />
                <h3 className="text-lg font-semibold">Recursos de Ayuda</h3>
              </div>
              <div className="space-y-3">
                <a
                  href="/docs/accesibilidad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="text-sm font-medium">Guía de Accesibilidad</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                
                <a
                  href="/support/accessibility"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="text-sm font-medium">Soporte Especializado</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                
                <a
                  href="/docs/keyboard-shortcuts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="text-sm font-medium">Atajos de Teclado</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
                
                <a
                  href="mailto:accessibility@freelanceconfia.com"
                  className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  <span className="text-sm font-medium">Contactar Equipo A11y</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </EnhancedCard>

          {/* Keyboard Shortcuts Quick Reference */}
          <EnhancedCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Atajos Rápidos</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Buscar</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + S</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Menú</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt + M</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Ayuda</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">F1</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Cerrar</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Escape</kbd>
                </div>
              </div>
            </div>
          </EnhancedCard>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 p-6 bg-muted/50 rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="font-semibold mb-1">¿Necesitas más ayuda?</h4>
            <p className="text-sm text-muted-foreground">
              Nuestro equipo de accesibilidad está disponible 24/7 para ayudarte.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Globe className="h-4 w-4 mr-2" />
              Documentación
            </Button>
            <Button size="sm">
              <Users className="h-4 w-4 mr-2" />
              Contactar Soporte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettingsPage;