import React, { useState } from 'react';
import { Star, MapPin, Clock, DollarSign, Eye, Heart, Share2, Award, CheckCircle, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import searchService, { type SearchResult, type SearchResponse } from '@/services/searchService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface SearchResultsProps {
  results: SearchResponse | null;
  loading?: boolean;
  onLoadMore?: () => void;
  onResultClick?: (result: SearchResult) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading = false,
  onLoadMore,
  onResultClick
}) => {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleFavorite = async (result: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await searchService.favoriteResult(result.id, result.type);
      
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(result.id)) {
          newSet.delete(result.id);
        } else {
          newSet.add(result.id);
        }
        return newSet;
      });

      toast({
        title: favoriteIds.has(result.id) ? "Eliminado de favoritos" : "Agregado a favoritos",
        description: `${result.title} ${favoriteIds.has(result.id) ? 'eliminado de' : 'agregado a'} tus favoritos`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar favoritos",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (result: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: result.title,
          text: result.description,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado",
        description: "El enlace se ha copiado al portapapeles"
      });
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyText = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'Urgente';
      case 'medium': return 'Moderado';
      case 'low': return 'Flexible';
      default: return '';
    }
  };

  const renderRating = (rating?: number, reviewCount?: number) => {
    if (!rating) return null;

    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium">{rating}</span>
        {reviewCount && (
          <span className="text-sm text-gray-500">({reviewCount})</span>
        )}
      </div>
    );
  };

  const renderProjectCard = (result: SearchResult) => (
    <Card 
      key={result.id} 
      className={`cursor-pointer transition-all hover:shadow-md border ${
        result.featured ? 'border-blue-200 bg-blue-50/30' : ''
      }`}
      onClick={() => onResultClick?.(result)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {result.title}
              </CardTitle>
              {result.featured && (
                <Badge variant="secondary" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Destacado
                </Badge>
              )}
              {result.urgency && (
                <Badge className={`text-xs ${getUrgencyColor(result.urgency)}`}>
                  {getUrgencyText(result.urgency)}
                </Badge>
              )}
            </div>
            
            <CardDescription className="line-clamp-2 mb-3">
              {result.description}
            </CardDescription>

            <div className="flex flex-wrap gap-1 mb-3">
              {result.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {result.skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{result.skills.length - 4} más
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleFavorite(result, e)}
                className={favoriteIds.has(result.id) ? 'text-red-500' : ''}
              >
                <Heart className={`h-4 w-4 ${favoriteIds.has(result.id) ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleShare(result, e)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {result.budget && (
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  ${result.budget.amount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {result.budget.type === 'hourly' ? '/hora' : 'precio fijo'}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            {result.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{result.location.city}, {result.location.country}</span>
                {result.location.distance && (
                  <span className="text-gray-400">
                    ({result.location.distance}km)
                  </span>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Hace {formatDistanceToNow(new Date(), { locale: es })}</span>
            </div>
          </div>

          {result.matchScore && (
            <div className="flex items-center gap-1">
              <span className="text-xs">Relevancia:</span>
              <Progress value={result.matchScore} className="w-16 h-2" />
              <span className="text-xs font-medium">{result.matchScore}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderFreelancerCard = (result: SearchResult) => (
    <Card 
      key={result.id} 
      className={`cursor-pointer transition-all hover:shadow-md ${
        result.featured ? 'border-blue-200 bg-blue-50/30' : ''
      }`}
      onClick={() => onResultClick?.(result)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={result.image} alt={result.title} />
            <AvatarFallback>
              {result.title.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg font-semibold">
                {result.title}
              </CardTitle>
              {result.isVerified && (
                <CheckCircle className="h-5 w-5 text-blue-500" />
              )}
              {result.featured && (
                <Badge variant="secondary" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  Top Rated
                </Badge>
              )}
              <div className={`h-3 w-3 rounded-full ${
                result.isOnline ? 'bg-green-400' : 'bg-gray-300'
              }`} />
            </div>

            <CardDescription className="line-clamp-2 mb-3">
              {result.description}
            </CardDescription>

            {renderRating(result.rating, result.reviewCount)}
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleFavorite(result, e)}
                className={favoriteIds.has(result.id) ? 'text-red-500' : ''}
              >
                <Heart className={`h-4 w-4 ${favoriteIds.has(result.id) ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleShare(result, e)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {result.budget && (
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  ${result.budget.amount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {result.budget.type === 'hourly' ? '/hora' : 'desde'}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {result.skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {result.skills.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{result.skills.length - 5} más
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              {result.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{result.location.city}, {result.location.country}</span>
                  {result.location.distance && (
                    <span className="text-gray-400">
                      ({result.location.distance}km)
                    </span>
                  )}
                </div>
              )}

              {result.completedProjects && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{result.completedProjects} proyectos</span>
                </div>
              )}

              {result.responseTime && (
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  <span>Responde en {result.responseTime}</span>
                </div>
              )}
            </div>

            {result.matchScore && (
              <div className="flex items-center gap-1">
                <span className="text-xs">Compatibilidad:</span>
                <Progress value={result.matchScore} className="w-16 h-2" />
                <span className="text-xs font-medium">{result.matchScore}%</span>
              </div>
            )}
          </div>

          {result.lastActive && (
            <div className="text-xs text-gray-500">
              Último acceso: {formatDistanceToNow(new Date(result.lastActive), { locale: es, addSuffix: true })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!results || results.results.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Eye className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron resultados
          </h3>
          <p className="text-gray-600 mb-4">
            Intenta ajustar tus filtros de búsqueda o usar términos diferentes
          </p>
          {results.suggestions && results.suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Sugerencias:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {results.suggestions.map((suggestion) => (
                  <Badge key={suggestion} variant="outline" className="cursor-pointer">
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {results.total.toLocaleString()} resultado{results.total !== 1 ? 's' : ''}
          </h2>
          <p className="text-gray-600">
            Página {results.page} de {results.totalPages}
          </p>
        </div>

        {/* Quick Filters from results */}
        {results.filters && (
          <div className="flex flex-wrap gap-2">
            {results.filters.categories.slice(0, 3).map((category) => (
              <Badge key={category.name} variant="outline" className="cursor-pointer">
                {category.name} ({category.count})
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.results.map((result) => (
          result.type === 'freelancer' 
            ? renderFreelancerCard(result)
            : renderProjectCard(result)
        ))}
      </div>

      {/* Load More */}
      {results.page < results.totalPages && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Cargar más resultados'}
          </Button>
        </div>
      )}

      {/* Recommendations */}
      {results.recommendations && results.recommendations.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <h3 className="text-lg font-semibold">Recomendaciones para ti</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.recommendations.slice(0, 4).map((recommendation) => (
              recommendation.type === 'freelancer'
                ? renderFreelancerCard(recommendation)
                : renderProjectCard(recommendation)
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;