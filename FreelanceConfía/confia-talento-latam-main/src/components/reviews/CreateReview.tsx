import React, { useState } from 'react';
import { Star, Send, MessageSquare, Clock, Award, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import reviewService, { type CreateReviewData } from '@/services/reviewService';
import { useToast } from '@/hooks/use-toast';

interface CreateReviewProps {
  projectId: string;
  revieweeId: string;
  revieweeName: string;
  revieweeAvatar?: string;
  projectTitle: string;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
}

const CreateReview: React.FC<CreateReviewProps> = ({
  projectId,
  revieweeId,
  revieweeName,
  revieweeAvatar,
  projectTitle,
  onReviewSubmitted,
  onCancel
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [aspects, setAspects] = useState({
    communication: 5,
    quality: 5,
    delivery: 5,
    professionalism: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const { toast } = useToast();

  const aspectLabels = {
    communication: 'Comunicación',
    quality: 'Calidad del trabajo',
    delivery: 'Entrega a tiempo',
    professionalism: 'Profesionalismo'
  };

  const aspectDescriptions = {
    communication: '¿Qué tan bien se comunicó durante el proyecto?',
    quality: '¿Qué tan satisfecho estás con la calidad del trabajo?',
    delivery: '¿Cumplió con los plazos acordados?',
    professionalism: '¿Qué tan profesional fue su comportamiento?'
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleAspectChange = (aspect: keyof typeof aspects, value: number[]) => {
    setAspects(prev => ({
      ...prev,
      [aspect]: value[0]
    }));
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast({
        title: "Comentario requerido",
        description: "Por favor escribe un comentario sobre tu experiencia",
        variant: "destructive"
      });
      return;
    }

    if (comment.length < 10) {
      toast({
        title: "Comentario muy corto",
        description: "El comentario debe tener al menos 10 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData: CreateReviewData = {
        projectId,
        revieweeId,
        rating,
        comment: comment.trim(),
        aspects
      };

      await reviewService.createReview(reviewData);
      
      toast({
        title: "Reseña enviada",
        description: "Tu reseña ha sido publicada exitosamente",
      });

      onReviewSubmitted?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la reseña. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating: number, onStarClick?: (rating: number) => void, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8'
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} cursor-pointer transition-colors ${
              star <= (hoveredStar || currentRating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={() => onStarClick?.(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
          />
        ))}
      </div>
    );
  };

  const getAverageRating = () => {
    const total = Object.values(aspects).reduce((sum, value) => sum + value, 0);
    return (total / 4).toFixed(1);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          Calificar experiencia
        </CardTitle>
        <CardDescription>
          Comparte tu experiencia trabajando en este proyecto
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Project and User Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Proyecto:</h3>
          <p className="text-gray-700 mb-3">{projectTitle}</p>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={revieweeAvatar} alt={revieweeName} />
              <AvatarFallback>
                {revieweeName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{revieweeName}</p>
              <p className="text-sm text-gray-600">Calificando a este usuario</p>
            </div>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Calificación General</Label>
          <div className="flex items-center gap-4">
            {renderStars(rating, handleStarClick, 'lg')}
            <span className="text-2xl font-bold text-gray-900">{rating}/5</span>
          </div>
          <p className="text-sm text-gray-600">
            Haz clic en las estrellas para calificar tu experiencia general
          </p>
        </div>

        {/* Aspect Ratings */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Calificaciones Específicas</Label>
          
          {Object.entries(aspects).map(([aspect, value]) => (
            <div key={aspect} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{aspectLabels[aspect as keyof typeof aspectLabels]}</p>
                  <p className="text-sm text-gray-600">
                    {aspectDescriptions[aspect as keyof typeof aspectDescriptions]}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(value, undefined, 'sm')}
                  <span className="text-sm font-medium w-8">{value}/5</span>
                </div>
              </div>
              
              <Slider
                value={[value]}
                onValueChange={(newValue) => handleAspectChange(aspect as keyof typeof aspects, newValue)}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          ))}
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <Award className="h-4 w-4 inline mr-1" />
              Promedio de aspectos: <strong>{getAverageRating()}/5</strong>
            </p>
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-3">
          <Label htmlFor="comment" className="text-base font-medium">
            Comentario sobre tu experiencia
          </Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe tu experiencia trabajando con este usuario. ¿Qué destacarías? ¿Qué podrían mejorar? (Mínimo 10 caracteres)"
            rows={4}
            maxLength={1000}
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{comment.length}/1000 caracteres</span>
            <span>{comment.length >= 10 ? '✓' : '✗'} Mínimo 10 caracteres</span>
          </div>
        </div>

        {/* Guidelines */}
        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            <strong>Consejos para una buena reseña:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
              <li>Sé específico sobre qué funcionó bien o qué se podría mejorar</li>
              <li>Mantén un tono profesional y constructivo</li>
              <li>Menciona la calidad del trabajo y la comunicación</li>
              <li>Tu reseña ayudará a otros usuarios a tomar mejores decisiones</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Warning for low ratings */}
        {rating <= 2 && (
          <Alert className="border-orange-200 bg-orange-50">
            <Clock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Una calificación baja puede afectar significativamente la reputación del usuario. 
              Asegúrate de que tu evaluación sea justa y esté bien fundamentada.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || comment.length < 10}
            className="flex-1"
          >
            {isSubmitting ? (
              'Enviando...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Reseña
              </>
            )}
          </Button>
        </div>

        {/* Success State */}
        {!isSubmitting && comment.length >= 10 && rating > 0 && (
          <div className="flex items-center justify-center text-green-600 text-sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            Listo para enviar
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateReview;