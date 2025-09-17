import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, Flag, Calendar, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import reviewService, { type Review } from '@/services/reviewService';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReviewDisplayProps {
  review: Review;
  canRespond?: boolean;
  showProjectTitle?: boolean;
  onReviewUpdated?: () => void;
}

const ReviewDisplay: React.FC<ReviewDisplayProps> = ({
  review,
  canRespond = false,
  showProjectTitle = false,
  onReviewUpdated
}) => {
  const [isResponding, setIsResponding] = useState(false);
  const [response, setResponse] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const { toast } = useToast();

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleMarkHelpful = async () => {
    try {
      await reviewService.markReviewHelpful(review._id);
      toast({
        title: "Marcado como útil",
        description: "Gracias por tu feedback",
      });
      onReviewUpdated?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar como útil",
        variant: "destructive"
      });
    }
  };

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      toast({
        title: "Respuesta vacía",
        description: "Por favor escribe una respuesta",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingResponse(true);
    try {
      await reviewService.respondToReview(review._id, response.trim());
      toast({
        title: "Respuesta enviada",
        description: "Tu respuesta ha sido publicada",
      });
      setIsResponding(false);
      setResponse('');
      onReviewUpdated?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast({
        title: "Motivo requerido",
        description: "Por favor especifica el motivo del reporte",
        variant: "destructive"
      });
      return;
    }

    try {
      await reviewService.reportReview(review._id, reportReason.trim());
      toast({
        title: "Reporte enviado",
        description: "Revisaremos esta reseña",
      });
      setIsReporting(false);
      setReportReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte",
        variant: "destructive"
      });
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingText = (rating: number) => {
    if (rating === 5) return 'Excelente';
    if (rating >= 4) return 'Muy bueno';
    if (rating >= 3) return 'Bueno';
    if (rating >= 2) return 'Regular';
    return 'Necesita mejorar';
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: es,
    });
  };

  const getAverageAspectRating = () => {
    const { communication, quality, delivery, professionalism } = review.aspects;
    return ((communication + quality + delivery + professionalism) / 4).toFixed(1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
              <AvatarFallback>
                {review.reviewerName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900">{review.reviewerName}</h4>
                <Badge variant="outline" className="text-xs">
                  {review.reviewerId === review.revieweeId ? 'Cliente' : 'Freelancer'}
                </Badge>
              </div>
              
              {showProjectTitle && (
                <p className="text-sm text-gray-600 mb-2">
                  Proyecto: <span className="font-medium">{review.projectTitle}</span>
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(review.createdAt)}
                </div>
                
                {review.helpful > 0 && (
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {review.helpful} útil{review.helpful !== 1 ? 'es' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {renderStars(review.rating)}
              <span className={`font-bold text-lg ${getRatingColor(review.rating)}`}>
                {review.rating}/5
              </span>
            </div>
            <span className={`text-sm font-medium ${getRatingColor(review.rating)}`}>
              {getRatingText(review.rating)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Aspect Ratings */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Comunicación</span>
              <div className="flex items-center gap-1">
                {renderStars(review.aspects.communication)}
                <span className="text-xs font-medium">{review.aspects.communication}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Calidad</span>
              <div className="flex items-center gap-1">
                {renderStars(review.aspects.quality)}
                <span className="text-xs font-medium">{review.aspects.quality}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Entrega</span>
              <div className="flex items-center gap-1">
                {renderStars(review.aspects.delivery)}
                <span className="text-xs font-medium">{review.aspects.delivery}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Profesionalismo</span>
              <div className="flex items-center gap-1">
                {renderStars(review.aspects.professionalism)}
                <span className="text-xs font-medium">{review.aspects.professionalism}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            <Award className="h-3 w-3 mr-1" />
            Promedio aspectos: {getAverageAspectRating()}/5
          </Badge>
        </div>

        {/* Review Comment */}
        <div className="space-y-2">
          <p className="text-gray-800 leading-relaxed">{review.comment}</p>
        </div>

        {/* Response */}
        {review.response && (
          <>
            <Separator />
            <div className="pl-4 border-l-4 border-blue-200 bg-blue-50 p-3 rounded-r-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Respuesta de {review.revieweeName}</span>
                <span className="text-xs text-blue-600">
                  {formatDate(review.response.createdAt)}
                </span>
              </div>
              <p className="text-blue-800">{review.response.comment}</p>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkHelpful}
              className="text-gray-600 hover:text-gray-800"
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Útil ({review.helpful})
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReporting(true)}
              className="text-gray-600 hover:text-red-600"
            >
              <Flag className="h-4 w-4 mr-1" />
              Reportar
            </Button>
          </div>

          {canRespond && !review.response && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResponding(true)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Responder
            </Button>
          )}
        </div>

        {/* Response Form */}
        {isResponding && (
          <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
            <h5 className="font-medium">Responder a esta reseña</h5>
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Escribe una respuesta profesional y constructiva..."
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{response.length}/500</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsResponding(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitResponse}
                  disabled={isSubmittingResponse || !response.trim()}
                >
                  {isSubmittingResponse ? 'Enviando...' : 'Enviar Respuesta'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Report Form */}
        {isReporting && (
          <div className="space-y-3 p-4 border border-red-200 rounded-lg bg-red-50">
            <h5 className="font-medium text-red-800">Reportar reseña</h5>
            <Textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="¿Por qué quieres reportar esta reseña? (spam, lenguaje inapropiado, información falsa, etc.)"
              rows={2}
              maxLength={200}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-red-600">{reportReason.length}/200</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReporting(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleReport}
                  disabled={!reportReason.trim()}
                >
                  Enviar Reporte
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewDisplay;