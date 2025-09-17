import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Search, Users, Briefcase, MapPin, Clock, Star } from 'lucide-react';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import SearchResults from '@/components/search/SearchResults';
import searchService, { type SearchFilters, type SearchResponse, type SearchResult } from '@/services/searchService';
import { useToast } from '@/hooks/use-toast';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'all' | 'projects' | 'freelancers'>(
    (searchParams.get('type') as 'all' | 'projects' | 'freelancers') || 'all'
  );
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [popularSearches, setPopularSearches] = useState<any[]>([]);
  const [searchStats, setSearchStats] = useState<any>(null);

  // Inicializar filtros desde URL
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>(() => {
    const filters: SearchFilters = {
      page: 1,
      limit: 20,
      sortBy: 'relevance'
    };

    // Cargar parámetros de la URL
    const query = searchParams.get('q');
    if (query) filters.query = query;

    const category = searchParams.get('category');
    if (category) filters.category = category;

    const skills = searchParams.get('skills');
    if (skills) filters.skills = skills.split(',');

    const location = searchParams.get('location');
    if (location) {
      filters.location = { city: location };
    }

    const budgetMin = searchParams.get('budget_min');
    const budgetMax = searchParams.get('budget_max');
    if (budgetMin || budgetMax) {
      filters.budget = {
        min: budgetMin ? parseInt(budgetMin) : undefined,
        max: budgetMax ? parseInt(budgetMax) : undefined,
      };
    }

    return filters;
  });

  useEffect(() => {
    loadInitialData();
    
    // Si hay parámetros de búsqueda en la URL, ejecutar búsqueda automáticamente
    if (searchParams.get('q')) {
      handleSearch(currentFilters);
    }
  }, []);

  const loadInitialData = async () => {
    try {
      const [statsData, recommendations] = await Promise.all([
        searchService.getSearchStats(),
        getCurrentUserRecommendations()
      ]);

      setSearchStats(statsData);
      setPopularSearches(statsData.popularKeywords.slice(0, 8));
      setRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const getCurrentUserRecommendations = async () => {
    try {
      // Intentar obtener recomendaciones personalizadas
      const userId = localStorage.getItem('userId'); // O desde contexto de auth
      if (userId) {
        return await searchService.getRecommendations(userId);
      }
      return [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  };

  const handleSearch = async (filters: SearchFilters) => {
    setLoading(true);
    setCurrentFilters(filters);

    try {
      let searchResults: SearchResponse;

      if (activeTab === 'projects') {
        searchResults = await searchService.searchProjects(filters);
      } else if (activeTab === 'freelancers') {
        searchResults = await searchService.searchFreelancers(filters);
      } else {
        searchResults = await searchService.search(filters);
      }

      setResults(searchResults);

      // Actualizar URL con parámetros de búsqueda
      updateURL(filters);

    } catch (error) {
      toast({
        title: "Error en la búsqueda",
        description: "No se pudo realizar la búsqueda. Intenta de nuevo.",
        variant: "destructive"
      });
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!results || !currentFilters) return;

    const nextPage = (currentFilters.page || 1) + 1;
    const newFilters = { ...currentFilters, page: nextPage };

    setLoading(true);
    try {
      let moreResults: SearchResponse;

      if (activeTab === 'projects') {
        moreResults = await searchService.searchProjects(newFilters);
      } else if (activeTab === 'freelancers') {
        moreResults = await searchService.searchFreelancers(newFilters);
      } else {
        moreResults = await searchService.search(newFilters);
      }

      // Combinar resultados existentes con nuevos
      setResults(prev => prev ? {
        ...moreResults,
        results: [...prev.results, ...moreResults.results]
      } : moreResults);

      setCurrentFilters(newFilters);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar más resultados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'project') {
      navigate(`/project/${result.id}`);
    } else {
      navigate(`/freelancer/${result.id}`);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'all' | 'projects' | 'freelancers');
    setResults(null);
    
    // Actualizar URL
    const newParams = new URLSearchParams(searchParams);
    newParams.set('type', tab);
    setSearchParams(newParams);

    // Si hay filtros activos, ejecutar nueva búsqueda
    if (currentFilters.query) {
      handleSearch({ ...currentFilters, page: 1 });
    }
  };

  const updateURL = (filters: SearchFilters) => {
    const params = new URLSearchParams();
    
    if (filters.query) params.set('q', filters.query);
    if (filters.category) params.set('category', filters.category);
    if (filters.skills?.length) params.set('skills', filters.skills.join(','));
    if (filters.location?.city) params.set('location', filters.location.city);
    if (filters.budget?.min) params.set('budget_min', filters.budget.min.toString());
    if (filters.budget?.max) params.set('budget_max', filters.budget.max.toString());
    if (activeTab !== 'all') params.set('type', activeTab);

    setSearchParams(params);
  };

  const handleQuickSearch = (query: string) => {
    const filters = { ...currentFilters, query, page: 1 };
    handleSearch(filters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Buscar en FreelanceConfía
          </h1>
          <p className="text-gray-600">
            Encuentra los mejores proyectos y freelancers de América Latina
          </p>
        </div>

        {/* Search Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Todo
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Proyectos
            </TabsTrigger>
            <TabsTrigger value="freelancers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Freelancers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <AdvancedSearch
              onResults={setResults}
              initialFilters={currentFilters}
              searchType="all"
            />
            
            {!results && !loading && (
              <div className="space-y-6">
                {/* Popular Searches */}
                {popularSearches.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Búsquedas populares
                      </CardTitle>
                      <CardDescription>
                        Los términos más buscados esta semana
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((search) => (
                          <Badge
                            key={search.keyword}
                            variant="outline"
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => handleQuickSearch(search.keyword)}
                          >
                            {search.keyword} ({search.count})
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recomendaciones para ti</CardTitle>
                      <CardDescription>
                        Basado en tu actividad y preferencias
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendations.slice(0, 4).map((rec) => (
                          <div
                            key={rec.title}
                            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                            onClick={() => handleSearch(rec.filters)}
                          >
                            <h4 className="font-medium mb-1">{rec.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                            <Badge variant="secondary" className="text-xs">
                              {rec.matchReason}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Search Stats */}
                {searchStats && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Estadísticas de la plataforma</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {searchStats.totalSearches?.toLocaleString() || '0'}
                          </div>
                          <div className="text-sm text-gray-600">Búsquedas realizadas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {searchStats.averageResultsPerSearch || '0'}
                          </div>
                          <div className="text-sm text-gray-600">Resultados promedio</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {searchStats.popularCategories?.length || '0'}
                          </div>
                          <div className="text-sm text-gray-600">Categorías activas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {searchStats.popularSkills?.length || '0'}
                          </div>
                          <div className="text-sm text-gray-600">Habilidades demandadas</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <SearchResults
              results={results}
              loading={loading}
              onLoadMore={handleLoadMore}
              onResultClick={handleResultClick}
            />
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <AdvancedSearch
              onResults={setResults}
              initialFilters={currentFilters}
              searchType="projects"
            />
            <SearchResults
              results={results}
              loading={loading}
              onLoadMore={handleLoadMore}
              onResultClick={handleResultClick}
            />
          </TabsContent>

          <TabsContent value="freelancers" className="space-y-6">
            <AdvancedSearch
              onResults={setResults}
              initialFilters={currentFilters}
              searchType="freelancers"
            />
            <SearchResults
              results={results}
              loading={loading}
              onLoadMore={handleLoadMore}
              onResultClick={handleResultClick}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SearchPage;