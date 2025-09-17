import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Key, Copy, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import securityService from '@/services/securityService';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorAuthProps {
  isEnabled: boolean;
  onStatusChange?: (enabled: boolean) => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ isEnabled, onStatusChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [setupData, setSetupData] = useState<{
    qrCode: string;
    backupCodes: string[];
    secret: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);
  const { toast } = useToast();

  const handleSetup2FA = async () => {
    setIsLoading(true);
    try {
      const data = await securityService.setup2FA();
      setSetupData(data);
      setIsSetupOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo configurar 2FA. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Ingresa un código de 6 dígitos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await securityService.verify2FA(verificationCode);
      if (result.verified && result.enabled) {
        toast({
          title: "2FA Activado",
          description: "La autenticación de dos factores ha sido activada exitosamente.",
        });
        setIsSetupOpen(false);
        setSetupData(null);
        setVerificationCode('');
        onStatusChange?.(true);
      } else {
        toast({
          title: "Código incorrecto",
          description: "El código ingresado no es válido. Inténtalo de nuevo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo verificar el código. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!password) {
      toast({
        title: "Contraseña requerida",
        description: "Ingresa tu contraseña para deshabilitar 2FA",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await securityService.disable2FA(password);
      if (result.disabled) {
        toast({
          title: "2FA Deshabilitado",
          description: "La autenticación de dos factores ha sido deshabilitada.",
        });
        setIsDisableOpen(false);
        setPassword('');
        onStatusChange?.(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo deshabilitar 2FA. Verifica tu contraseña.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    if (setupData?.backupCodes) {
      const codesText = setupData.backupCodes.join('\n');
      navigator.clipboard.writeText(codesText);
      setCopiedBackupCodes(true);
      toast({
        title: "Códigos copiados",
        description: "Los códigos de respaldo han sido copiados al portapapeles.",
      });
    }
  };

  const copySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      toast({
        title: "Secreto copiado",
        description: "El secreto ha sido copiado al portapapeles.",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Autenticación de Dos Factores (2FA)
            </span>
            {isEnabled ? (
              <Badge className="bg-green-100 text-green-800">
                <Check className="h-3 w-3 mr-1" />
                Activado
              </Badge>
            ) : (
              <Badge variant="outline">Desactivado</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Agrega una capa extra de seguridad a tu cuenta utilizando una aplicación de autenticación.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isEnabled ? (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  La autenticación de dos factores está activada y protegiendo tu cuenta.
                </AlertDescription>
              </Alert>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    Tu cuenta está protegida con 2FA. Se te solicitará un código de tu aplicación de autenticación al iniciar sesión.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsDisableOpen(true)}
                  className="text-red-600 hover:text-red-700"
                >
                  Deshabilitar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Tu cuenta no está protegida con 2FA. Se recomienda activarla para mayor seguridad.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Beneficios del 2FA:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Protección adicional contra accesos no autorizados</li>
                  <li>• Seguridad incluso si tu contraseña es comprometida</li>
                  <li>• Funciona con aplicaciones como Google Authenticator o Authy</li>
                </ul>
              </div>

              <Button onClick={handleSetup2FA} disabled={isLoading}>
                <Smartphone className="h-4 w-4 mr-2" />
                {isLoading ? 'Configurando...' : 'Activar 2FA'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Autenticación de Dos Factores</DialogTitle>
            <DialogDescription>
              Escanea el código QR con tu aplicación de autenticación preferida.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {setupData && (
              <>
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border inline-block">
                    <img 
                      src={setupData.qrCode} 
                      alt="QR Code para 2FA" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Código manual (si no puedes escanear el QR):</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={setupData.secret}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button size="sm" variant="outline" onClick={copySecret}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Código de verificación:</Label>
                  <Input
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Ingresa el código de 6 dígitos"
                    maxLength={6}
                  />
                </div>

                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Códigos de respaldo:</strong> Guarda estos códigos en un lugar seguro.
                    Puedes usarlos para acceder a tu cuenta si pierdes tu dispositivo.
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {setupData.backupCodes.map((code, index) => (
                      <div key={index} className="bg-white p-2 rounded border text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyBackupCodes}
                    className="mt-2 w-full"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copiedBackupCodes ? 'Copiado' : 'Copiar códigos'}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsSetupOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleVerify2FA}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="flex-1"
                  >
                    {isLoading ? 'Verificando...' : 'Activar 2FA'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={isDisableOpen} onOpenChange={setIsDisableOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Deshabilitar 2FA</DialogTitle>
            <DialogDescription>
              Ingresa tu contraseña para deshabilitar la autenticación de dos factores.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                <strong>Advertencia:</strong> Deshabilitar 2FA reducirá la seguridad de tu cuenta.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña actual:</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDisableOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDisable2FA}
                disabled={isLoading || !password}
                variant="destructive"
                className="flex-1"
              >
                {isLoading ? 'Deshabilitando...' : 'Deshabilitar 2FA'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TwoFactorAuth;