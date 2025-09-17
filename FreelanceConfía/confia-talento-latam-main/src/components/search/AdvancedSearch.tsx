import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, DollarSign, Clock, Star, Bookmark, History, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import searchService, { type SearchFilters, type SearchResult, type SearchResponse } from '@/services/searchService';
import { debounce } from 'lodash';

interface AdvancedSearchProps {
  onResults?: (results: SearchResponse) => void;
  initialFilters?: Partial<SearchFilters>;
  searchType?: 'all' | 'projects' | 'freelancers';
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onResults,
  initialFilters = {},
  searchType = 'all'
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    page: 1,
    limit: 20,
    sortBy: 'relevance',
    ...initialFilters
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [skillSuggestions, setSkillSuggestions] = useState<any[]>([]);
  const [availableFilters, setAvailableFilters] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    loadAvailableFilters();
    loadSearchHistory();
    loadSavedSearches();
    getUserLocation();
  }, []);

  const loadAvailableFilters = async () => {
    try {
      const filtersData = await searchService.getAvailableFilters();
      setAvailableFilters(filtersData);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const history = await searchService.getSearchHistory(5);
      setSearchHistory(history);
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const loadSavedSearches = async () => {
    try {
      const saved = await searchService.getSavedSearches();
      setSavedSearches(saved);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(position);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  const debouncedGetSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length > 2) {
        try {
          const suggestions = await searchService.getSearchSuggestions(query);
          setSuggestions(suggestions);
        } catch (error) {
          console.error('Error getting suggestions:', error);
        }
      } else {
        setSuggestions([]);
      }
    }, 300),
    []
  );

  const debouncedGetLocationSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length > 2) {
        try {
          const locations = await searchService.getLocationSuggestions(query);
          setLocationSuggestions(locations);
        } catch (error) {
          console.error('Error getting location suggestions:', error);
        }
      } else {
        setLocationSuggestions([]);
      }
    }, 300),
    []
  );

  const debouncedGetSkillSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length > 1) {
        try {
          const skills = await searchService.getSkillSuggestions(query);
          setSkillSuggestions(skills);
        } catch (error) {
          console.error('Error getting skill suggestions:', error);
        }
      } else {
        setSkillSuggestions([]);
      }
    }, 300),
    []
  );

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      let results: SearchResponse;
      
      if (searchType === 'projects') {
        results = await searchService.searchProjects(filters);
      } else if (searchType === 'freelancers') {
        results = await searchService.searchFreelancers(filters);
      } else {
        results = await searchService.search(filters);
      }

      onResults?.(results);
      
      // Actualizar historial
      loadSearchHistory();
    } catch (error) {
      toast({
        title: "Error en la búsqueda",
        description: "No se pudo realizar la búsqueda. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSemanticSearch = async () => {
    if (!filters.query) {
      toast({
        title: "Consulta vacía",
        description: "Escribe algo para realizar una búsqueda semántica",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchService.semanticSearch(
        filters.query, 
        searchType === 'all' ? undefined : searchType
      );
      onResults?.(results);
    } catch (error) {
      toast({
        title: "Error en búsqueda semántica",
        description: "No se pudo realizar la búsqueda semántica. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseLocation = () => {
    if (userLocation) {
      setFilters(prev => ({
        ...prev,
        location: {
          ...prev.location,
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          radius: prev.location?.radius || 50
        }
      }));
      toast({
        title: "Ubicación actualizada",
        description: "Se ha configurado tu ubicación actual"
      });
    } else {
      toast({
        title: "Ubicación no disponible",
        description: "No se pudo obtener tu ubicación",
        variant: "destructive"
      });
    }
  };

  const handleSaveSearch = async () => {
    if (!filters.query) {
      toast({
        title: "Búsqueda vacía",
        description: "Configura algunos filtros antes de guardar",
        variant: "destructive"
      });
      return;
    }

    try {
      const name = `Búsqueda: ${filters.query}`;
      await searchService.saveSearch(name, filters, false);
      toast({
        title: "Búsqueda guardada",
        description: "La búsqueda se ha guardado correctamente"
      });
      loadSavedSearches();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la búsqueda",
        variant: "destructive"
      });
    }
  };

  const handleLoadSavedSearch = (search: any) => {
    setFilters(search.filters);
    toast({
      title: "Búsqueda cargada",
      description: `Se ha cargado "${search.name}"`
    });
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      page: 1,
      limit: 20,
      sortBy: 'relevance'
    });
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: [...(prev.skills || []), skill]
    }));
  };

  const removeSkill = (skillToRemove: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }));
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="¿Qué estás buscando? (ej: desarrollador web, diseño de logo, traducción...)"
            value={filters.query || ''}
            onChange={(e) => {
              updateFilter('query', e.target.value);
              debouncedGetSuggestions(e.target.value);
            }}
            className="pl-10 pr-32"
          />
          <div className="absolute right-2 top-1 flex gap-1">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleSemanticSearch}
              disabled={isSearching}
            >
              IA
            </Button>
            <Button 
              size="sm" 
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </div>

        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <Card className="absolute z-10 w-full">
            <CardContent className="p-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded"
                  onClick={() => {
                    updateFilter('query', suggestion);
                    setSuggestions([]);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtros Avanzados
            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleUseLocation}>
            <MapPin className="h-4 w-4 mr-1" />
            Usar mi ubicación
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleSaveSearch}>
            <Bookmark className="h-4 w-4 mr-1" />
            Guardar búsqueda
          </Button>
          
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleContent className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category and Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Categoría</label>
                  <Select 
                    value={filters.category || ''} 
                    onValueChange={(value) => updateFilter('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las categorías</SelectItem>
                      {availableFilters?.categories?.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} ({cat.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Habilidades</label>
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <span>Agregar habilidad</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Buscar habilidades..." 
                            onValueChange={debouncedGetSkillSuggestions}
                          />
                          <CommandEmpty>No se encontraron habilidades.</CommandEmpty>
                          <CommandGroup>
                            {skillSuggestions.map((skill) => (
                              <CommandItem
                                key={skill.id}
                                onSelect={() => addSkill(skill.name)}
                              >
                                {skill.name}
                                <Badge variant="secondary" className="ml-auto">
                                  {skill.category}
                                </Badge>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    
                    {filters.skills && filters.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {filters.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Location */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Ubicación</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      placeholder="País"
                      value={filters.location?.country || ''}
                      onChange={(e) => updateFilter('location', {
                        ...filters.location,
                        country: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Ciudad"
                      value={filters.location?.city || ''}
                      onChange={(e) => {
                        updateFilter('location', {
                          ...filters.location,
                          city: e.target.value
                        });
                        debouncedGetLocationSuggestions(e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Radio (km)"
                      value={filters.location?.radius || ''}
                      onChange={(e) => updateFilter('location', {
                        ...filters.location,
                        radius: parseInt(e.target.value) || undefined
                      })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Budget */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Presupuesto</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Select 
                      value={filters.budget?.type || ''} 
                      onValueChange={(value: 'fixed' | 'hourly') => updateFilter('budget', {
                        ...filters.budget,
                        type: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Precio fijo</SelectItem>
                        <SelectItem value="hourly">Por hora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Mínimo"
                      value={filters.budget?.min || ''}
                      onChange={(e) => updateFilter('budget', {
                        ...filters.budget,
                        min: parseInt(e.target.value) || undefined
                      })}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Máximo"
                      value={filters.budget?.max || ''}
                      onChange={(e) => updateFilter('budget', {
                        ...filters.budget,
                        max: parseInt(e.target.value) || undefined
                      })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Other Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Experiencia</label>
                  <Select 
                    value={filters.experience || ''} 
                    onValueChange={(value: 'entry' | 'intermediate' | 'expert') => updateFilter('experience', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Cualquier nivel</SelectItem>
                      <SelectItem value="entry">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="expert">Experto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Disponibilidad</label>
                  <Select 
                    value={filters.availability || ''} 
                    onValueChange={(value: 'available' | 'busy' | 'any') => updateFilter('availability', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquiera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Cualquiera</SelectItem>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="busy">Ocupado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Calificación mínima</label>
                  <div className="px-3">
                    <Slider
                      value={[filters.rating?.min || 0]}
                      onValueChange={(values) => updateFilter('rating', {
                        ...filters.rating,
                        min: values[0]
                      })}
                      max={5}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>{filters.rating?.min || 0} estrellas</span>
                      <span>5</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Sort */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Ordenar por</label>
                <Select 
                  value={filters.sortBy || 'relevance'} 
                  onValueChange={(value) => updateFilter('sortBy', value)}
                >
                  <SelectTrigger className="w-full md:w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevancia</SelectItem>
                    <SelectItem value="rating">Mejor calificados</SelectItem>
                    <SelectItem value="price_low">Precio: menor a mayor</SelectItem>
                    <SelectItem value="price_high">Precio: mayor a menor</SelectItem>
                    <SelectItem value="newest">Más recientes</SelectItem>
                    <SelectItem value="distance">Más cercanos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Search History and Saved Searches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search History */}
        {searchHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <History className="h-4 w-4 mr-2" />
                Búsquedas recientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {searchHistory.map((search) => (
                <button
                  key={search.id}
                  className="w-full text-left p-2 rounded hover:bg-gray-100 text-sm"
                  onClick={() => {
                    setFilters(search.filters);
                    handleSearch();
                  }}
                >
                  <div className="font-medium">{search.query}</div>
                  <div className="text-gray-500 text-xs">
                    {search.resultCount} resultados
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Bookmark className="h-4 w-4 mr-2" />
                Búsquedas guardadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {savedSearches.map((search) => (
                <div
                  key={search._id}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-100"
                >
                  <button
                    className="text-left flex-1"
                    onClick={() => handleLoadSavedSearch(search)}
                  >
                    <div className="font-medium text-sm">{search.name}</div>
                    <div className="text-gray-500 text-xs">
                      {search.resultCount} resultados
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        await searchService.deleteSavedSearch(search._id);
                        loadSavedSearches();
                        toast({
                          title: "Búsqueda eliminada",
                          description: "La búsqueda guardada se ha eliminado"
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "No se pudo eliminar la búsqueda",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;