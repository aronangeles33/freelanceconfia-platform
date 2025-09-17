import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface ConsentBannerProps {
  onAccept?: (preferences: ConsentPreferences) => void;
  onDecline?: () => void;
  className?: string;
}

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const CONSENT_STORAGE_KEY = 'freelanceconfia_consent';

const ConsentBanner: React.FC<ConsentBannerProps> = ({
  onAccept,
  onDecline,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always true
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const existingConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!existingConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    
    saveConsent(allAccepted);
    onAccept?.(allAccepted);
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    saveConsent(preferences);
    onAccept?.(preferences);
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    const necessaryOnly: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    
    saveConsent(necessaryOnly);
    onDecline?.();
    setIsVisible(false);
  };

  const saveConsent = (consentPrefs: ConsentPreferences) => {
    const consentData = {
      preferences: consentPrefs,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('consentUpdated', { 
      detail: consentPrefs 
    }));
  };

  const updatePreference = (key: keyof ConsentPreferences, value: boolean) => {
    if (key === 'necessary') return; // Necessary cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-sm border-t shadow-lg ${className}`}>
      <Card className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🍪 Configuración de Cookies
            </h3>
            
            {!showDetails ? (
              <p className="text-gray-600 text-sm leading-relaxed">
                Utilizamos cookies para mejorar tu experiencia, analizar el tráfico del sitio y personalizar el contenido. 
                Puedes aceptar todas las cookies o personalizar tus preferencias.
              </p>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Gestiona tus preferencias de cookies. Las cookies necesarias siempre están habilitadas.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Cookies Necesarias</h4>
                      <p className="text-xs text-gray-600">Esenciales para el funcionamiento del sitio</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Cookies de Análisis</h4>
                      <p className="text-xs text-gray-600">Nos ayudan a entender cómo usas nuestro sitio</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => updatePreference('analytics', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Cookies de Marketing</h4>
                      <p className="text-xs text-gray-600">Para mostrar anuncios relevantes y contenido personalizado</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => updatePreference('marketing', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Cookies de Preferencias</h4>
                      <p className="text-xs text-gray-600">Recuerdan tus configuraciones y preferencias</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.preferences}
                      onChange={(e) => updatePreference('preferences', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col lg:flex-row gap-2 lg:items-start">
            {!showDetails ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(true)}
                  className="whitespace-nowrap"
                >
                  Personalizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeclineAll}
                  className="whitespace-nowrap"
                >
                  Solo necesarias
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="whitespace-nowrap bg-blue-600 hover:bg-blue-700"
                >
                  Aceptar todas
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="whitespace-nowrap"
                >
                  Volver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeclineAll}
                  className="whitespace-nowrap"
                >
                  Solo necesarias
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptSelected}
                  className="whitespace-nowrap bg-blue-600 hover:bg-blue-700"
                >
                  Guardar preferencias
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t text-xs text-gray-500">
          <p>
            Al continuar navegando, aceptas nuestra{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Política de Privacidad
            </a>{' '}
            y{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              Términos de Uso
            </a>
            .
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ConsentBanner;

// Helper function to get current consent
export const getConsentPreferences = (): ConsentPreferences | null => {
  try {
    const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (consent) {
      const parsed = JSON.parse(consent);
      return parsed.preferences;
    }
  } catch (error) {
    console.error('Error reading consent preferences:', error);
  }
  return null;
};

// Helper function to check if analytics is allowed
export const isAnalyticsAllowed = (): boolean => {
  const preferences = getConsentPreferences();
  return preferences?.analytics ?? false;
};

// Helper function to check if marketing is allowed
export const isMarketingAllowed = (): boolean => {
  const preferences = getConsentPreferences();
  return preferences?.marketing ?? false;
};