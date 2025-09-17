import React, { useState, useEffect } from 'react';
import { Star, Award, TrendingUp, Users, Trophy, Target, Calendar, Zap, Badge as BadgeIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import reviewService, { type Review, type Badge as ReviewBadge, type QualityMetrics } from '@/services/reviewService';
import { useToast } from '@/hooks/use-toast';
import ReviewDisplay from './ReviewDisplay';
import CreateReview from './CreateReview';

interface ReputationDashboardProps {
  userId: string;
  isOwnProfile?: boolean;
  userType: 'freelancer' | 'client';
}

const ReputationDashboard: React.FC<ReputationDashboardProps> = ({
  userId,
  isOwnProfile = false,
  userType
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [badges, setBadges] = useState<ReviewBadge[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [reputationData, setReputationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const { toast } = useToast();

  useEffect(() => {
    loadReputationData();
  }, [userId]);

  const loadReputationData = async () => {
    setLoading(true);
    try {
      const [reviewsData, badgesData, metricsData, reputationInfo] = await Promise.all([
        reviewService.getUserReviews(userId),
        reviewService.getUserBadges(userId),
        reviewService.getQualityMetrics(userId),
        reviewService.getReputationData(userId)
      ]);

      setReviews(reviewsData.reviews);
      setBadges(badgesData);
      setQualityMetrics(metricsData);
      setReputationData(reputationInfo);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información de reputación",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAverageRating = (): number => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const getAspectAverages = () => {
    if (reviews.length === 0) return { communication: 0, quality: 0, delivery: 0, professionalism: 0 };

    const totals = reviews.reduce((acc, review) => ({
      communication: acc.communication + review.aspects.communication,
      quality: acc.quality + review.aspects.quality,
      delivery: acc.delivery + review.aspects.delivery,
      professionalism: acc.professionalism + review.aspects.professionalism,
    }), { communication: 0, quality: 0, delivery: 0, professionalism: 0 });

    return {
      communication: parseFloat((totals.communication / reviews.length).toFixed(1)),
      quality: parseFloat((totals.quality / reviews.length).toFixed(1)),
      delivery: parseFloat((totals.delivery / reviews.length).toFixed(1)),
      professionalism: parseFloat((totals.professionalism / reviews.length).toFixed(1)),
    };
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getBadgeIcon = (badgeType: string) => {
    const icons: { [key: string]: any } = {
      'top_rated': Trophy,
      'reliable': Target,
      'communicator': Users,
      'quality_expert': Award,
      'fast_delivery': Zap,
    };
    return icons[badgeType] || BadgeIcon;
  };

  const getBadgeColor = (badgeType: string) => {
    const colors: { [key: string]: string } = {
      'top_rated': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'reliable': 'bg-blue-100 text-blue-800 border-blue-200',
      'communicator': 'bg-green-100 text-green-800 border-green-200',
      'quality_expert': 'bg-purple-100 text-purple-800 border-purple-200',
      'fast_delivery': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[badgeType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const avgRating = getAverageRating();
  const distribution = getRatingDistribution();
  const aspectAverages = getAspectAverages();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isOwnProfile ? 'Mi Reputación' : 'Reputación'}
          </h2>
          <p className="text-gray-600">
            {isOwnProfile ? 'Administra tu reputación y reseñas' : 'Reseñas y calificaciones'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {renderStars(Math.round(avgRating), 'lg')}
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{avgRating}</div>
            <div className="text-sm text-gray-500">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Calificación Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{avgRating}</span>
              {renderStars(Math.round(avgRating))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Reseñas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
            <div className="text-sm text-gray-500">
              {reviews.filter(r => r.rating >= 4).length} positivas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Insignias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badges.length}</div>
            <div className="text-sm text-gray-500">obtenidas</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Puntuación de Reputación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reputationData?.score || 0}</div>
            <div className="text-sm text-gray-500">de 1000 puntos</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="reviews">Reseñas ({reviews.length})</TabsTrigger>
          <TabsTrigger value="badges">Insignias ({badges.length})</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Calificaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm w-6">{rating}</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <Progress 
                    value={reviews.length > 0 ? (distribution[rating as keyof typeof distribution] / reviews.length) * 100 : 0}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-8">
                    {distribution[rating as keyof typeof distribution]}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Aspect Ratings */}
          <Card>
            <CardHeader>
              <CardTitle>Calificaciones por Aspecto</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Comunicación</span>
                  <div className="flex items-center gap-2">
                    {renderStars(Math.round(aspectAverages.communication))}
                    <span className="text-sm font-bold">{aspectAverages.communication}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Calidad</span>
                  <div className="flex items-center gap-2">
                    {renderStars(Math.round(aspectAverages.quality))}
                    <span className="text-sm font-bold">{aspectAverages.quality}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Entrega</span>
                  <div className="flex items-center gap-2">
                    {renderStars(Math.round(aspectAverages.delivery))}
                    <span className="text-sm font-bold">{aspectAverages.delivery}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Profesionalismo</span>
                  <div className="flex items-center gap-2">
                    {renderStars(Math.round(aspectAverages.professionalism))}
                    <span className="text-sm font-bold">{aspectAverages.professionalism}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No hay reseñas aún</h3>
                <p className="text-gray-600">
                  {isOwnProfile 
                    ? 'Completa proyectos para recibir tus primeras reseñas'
                    : 'Este usuario aún no tiene reseñas'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <ReviewDisplay
                key={review._id}
                review={review}
                canRespond={isOwnProfile && !review.response}
                showProjectTitle={true}
                onReviewUpdated={loadReputationData}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          {badges.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No hay insignias aún</h3>
                <p className="text-gray-600">
                  Completa proyectos y mantén alta calidad para ganar insignias
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => {
                const IconComponent = getBadgeIcon(badge.type);
                return (
                  <Card key={badge._id} className={`border-2 ${getBadgeColor(badge.type)}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-white/50">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{badge.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {badge.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm">
                        <span>Obtenida:</span>
                        <span>{new Date(badge.earnedAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {qualityMetrics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Calidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Tasa de Finalización</span>
                    <span className="font-bold">{qualityMetrics.completionRate}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Entrega a Tiempo</span>
                    <span className="font-bold">{qualityMetrics.onTimeDelivery}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Tiempo de Respuesta</span>
                    <span className="font-bold">{qualityMetrics.responseTime}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Tasa de Repetición</span>
                    <span className="font-bold">{qualityMetrics.repeatClientRate}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas Generales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Proyectos Completados</span>
                    <span className="font-bold">{reputationData?.projectsCompleted || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Ingresos Totales</span>
                    <span className="font-bold">${reputationData?.totalEarnings || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Miembro Desde</span>
                    <span className="font-bold">
                      {reputationData?.memberSince 
                        ? new Date(reputationData.memberSince).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Última Actividad</span>
                    <span className="font-bold">
                      {reputationData?.lastActivity 
                        ? new Date(reputationData.lastActivity).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">Métricas no disponibles</h3>
                <p className="text-gray-600">
                  Las métricas de calidad se generarán después de completar algunos proyectos
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReputationDashboard;