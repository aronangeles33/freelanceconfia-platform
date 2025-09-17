import React, { useState } from 'react';
import { Camera, Upload, Check, AlertTriangle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import securityService, { type IdentityVerificationData } from '@/services/securityService';
import { useToast } from '@/hooks/use-toast';

interface IdentityVerificationProps {
  onVerificationSubmitted?: () => void;
  verificationStatus?: 'pending' | 'approved' | 'rejected' | null;
}

const IdentityVerification: React.FC<IdentityVerificationProps> = ({
  onVerificationSubmitted,
  verificationStatus
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<IdentityVerificationData>>({
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    }
  });
  const [documentImages, setDocumentImages] = useState<File[]>([]);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const { toast } = useToast();

  const documentTypes = [
    { value: 'passport', label: 'Pasaporte' },
    { value: 'id_card', label: 'Cédula de Identidad' },
    { value: 'driver_license', label: 'Licencia de Conducir' }
  ];

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address!,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleDocumentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 2) {
      toast({
        title: "Error",
        description: "Máximo 2 imágenes del documento (frente y reverso)",
        variant: "destructive"
      });
      return;
    }
    setDocumentImages(files);
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfieImage(file);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.documentType && formData.documentNumber && formData.birthDate);
      case 2:
        return !!(
          formData.address?.street &&
          formData.address?.city &&
          formData.address?.state &&
          formData.address?.country &&
          formData.address?.postalCode
        );
      case 3:
        return documentImages.length > 0 && !!selfieImage;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast({
        title: "Información incompleta",
        description: "Por favor complete todos los campos antes de continuar",
        variant: "destructive"
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast({
        title: "Error",
        description: "Por favor complete toda la información requerida",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const verificationData: IdentityVerificationData = {
        documentType: formData.documentType as any,
        documentNumber: formData.documentNumber!,
        documentImages,
        selfieImage: selfieImage!,
        address: formData.address!,
        birthDate: formData.birthDate!
      };

      await securityService.submitIdentityVerification(verificationData);
      
      toast({
        title: "Verificación enviada",
        description: "Tu solicitud de verificación ha sido enviada. Te notificaremos cuando sea revisada.",
      });

      setCurrentStep(4);
      onVerificationSubmitted?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la verificación. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Verificado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="outline">No verificado</Badge>;
    }
  };

  if (verificationStatus === 'approved') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Identidad Verificada
          </CardTitle>
          <CardDescription>
            Tu identidad ha sido verificada exitosamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-green-600">¡Verificación completada!</p>
              <p className="text-gray-600">Tu cuenta tiene un nivel de seguridad alto</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verificación de Identidad
          </span>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Verifica tu identidad para aumentar la confianza y acceder a más funcionalidades.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {verificationStatus === 'pending' ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Tu verificación está siendo revisada. Te notificaremos cuando sea completada.
            </AlertDescription>
          </Alert>
        ) : verificationStatus === 'rejected' ? (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">
              Tu verificación fue rechazada. Puedes enviar nuevos documentos.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Paso {currentStep} de 3</span>
                <span>{Math.round((currentStep / 3) * 100)}% completado</span>
              </div>
              <Progress value={(currentStep / 3) * 100} className="h-2" />
            </div>

            {/* Step 1: Document Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Información del Documento</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="documentType">Tipo de Documento</Label>
                    <Select onValueChange={(value) => handleInputChange('documentType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de documento" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="documentNumber">Número de Documento</Label>
                    <Input
                      id="documentNumber"
                      value={formData.documentNumber || ''}
                      onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                      placeholder="Ingresa el número de documento"
                    />
                  </div>

                  <div>
                    <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate || ''}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Información de Dirección</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="street">Dirección</Label>
                    <Input
                      id="street"
                      value={formData.address?.street || ''}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      placeholder="Calle y número"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={formData.address?.city || ''}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        placeholder="Ciudad"
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">Estado/Provincia</Label>
                      <Input
                        id="state"
                        value={formData.address?.state || ''}
                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                        placeholder="Estado o provincia"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">País</Label>
                      <Input
                        id="country"
                        value={formData.address?.country || ''}
                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                        placeholder="País"
                      />
                    </div>

                    <div>
                      <Label htmlFor="postalCode">Código Postal</Label>
                      <Input
                        id="postalCode"
                        value={formData.address?.postalCode || ''}
                        onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                        placeholder="Código postal"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Document Upload */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Subir Documentos</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Imágenes del Documento (Frente y Reverso)</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Haz clic para subir o arrastra las imágenes aquí
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleDocumentImageChange}
                        className="hidden"
                        id="documentImages"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('documentImages')?.click()}
                      >
                        Seleccionar Imágenes
                      </Button>
                      {documentImages.length > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          {documentImages.length} archivo(s) seleccionado(s)
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Selfie con el Documento</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Sube una selfie sosteniendo tu documento
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSelfieChange}
                        className="hidden"
                        id="selfieImage"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('selfieImage')?.click()}
                      >
                        Tomar Selfie
                      </Button>
                      {selfieImage && (
                        <p className="text-sm text-green-600 mt-2">
                          Selfie seleccionada: {selfieImage.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Asegúrate de que las imágenes sean claras y todos los datos sean legibles.
                    El proceso de verificación puede tomar 1-3 días hábiles.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <div className="text-center py-8">
                <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-600 mb-2">
                  ¡Verificación Enviada!
                </h3>
                <p className="text-gray-600 mb-4">
                  Hemos recibido tu documentación. Te notificaremos cuando la verificación sea completada.
                </p>
                <p className="text-sm text-gray-500">
                  Tiempo estimado: 1-3 días hábiles
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Anterior
                </Button>

                {currentStep === 3 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !validateStep(currentStep)}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Verificación'}
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                  >
                    Siguiente
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IdentityVerification;