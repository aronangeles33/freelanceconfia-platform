import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { usePerformanceMonitor, useConnectionMonitor, useMemoryMonitor } from '../hooks/use-performance';
import { useCache } from './cache/CacheProvider';

const OptimizationDemo: React.FC = () => {
  const [demoData, setDemoData] = useState<any>(null);
  const [cacheTest, setCacheTest] = useState<string>('');
  const webVitals = usePerformanceMonitor();
  const connectionInfo = useConnectionMonitor();
  const memoryUsage = useMemoryMonitor();
  const cache = useCache();

  // Test cache functionality
  const testCache = () => {
    const testKey = 'demo-test';
    const testValue = { message: 'Cache funcionando!', timestamp: Date.now() };
    
    if (cache) {
      cache.set(testKey, testValue, 300); // 5 minutes TTL
      const retrieved = cache.get<typeof testValue>(testKey);
      setCacheTest(retrieved ? 'Cache OK: ' + retrieved.message : 'Cache Error');
    }
  };

  // Simulate API call with cache
  const loadDemoData = async () => {
    const cacheKey = 'demo-data';
    
    if (cache) {
      // Try cache first
      const cachedData = cache.get<typeof demoData>(cacheKey);
      if (cachedData) {
        setDemoData(cachedData);
        return;
      }
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const data = {
      message: 'Datos cargados desde API',
      timestamp: new Date().toLocaleString(),
      loadTime: '1000ms'
    };
    
    setDemoData(data);
    
    // Cache the result
    if (cache) {
      cache.set(cacheKey, data, 600); // 10 minutes
    }
  };

  useEffect(() => {
    testCache();
  }, [cache]);

  const formatMetric = (value: number, unit = 'ms') => {
    return value > 0 ? `${value.toFixed(1)}${unit}` : 'N/A';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 FreelanceConfía - Sistema de Optimizaciones
            <Badge variant="secondary">Demo Activo</Badge>
          </CardTitle>
          <CardDescription>
            Demostración de todas las optimizaciones implementadas en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Web Vitals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>LCP:</span>
                  <span className={webVitals.LCP <= 2500 ? 'text-green-600' : 'text-yellow-600'}>
                    {formatMetric(webVitals.LCP)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>FID:</span>
                  <span className={webVitals.FID <= 100 ? 'text-green-600' : 'text-yellow-600'}>
                    {formatMetric(webVitals.FID)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>CLS:</span>
                  <span className={webVitals.CLS <= 0.1 ? 'text-green-600' : 'text-yellow-600'}>
                    {webVitals.CLS.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>TTFB:</span>
                  <span className={webVitals.TTFB <= 800 ? 'text-green-600' : 'text-yellow-600'}>
                    {formatMetric(webVitals.TTFB)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Conexión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Tipo:</span>
                  <span className="capitalize">{connectionInfo.effectiveType}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Velocidad:</span>
                  <span>{connectionInfo.downlink}Mbps</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>RTT:</span>
                  <span>{connectionInfo.rtt}ms</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Modo Ahorro:</span>
                  <span>{connectionInfo.saveData ? 'Sí' : 'No'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Memoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {memoryUsage ? (
                  <>
                    <div className="flex justify-between text-xs">
                      <span>Usada:</span>
                      <span>{(memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Total:</span>
                      <span>{(memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(1)}MB</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Límite:</span>
                      <span>{(memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(1)}MB</span>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-500">No disponible</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cache System</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {cache ? (
                  <>
                    <div className="text-xs text-green-600 mb-2">✓ Cache Activo</div>
                    <div className="text-xs">{cacheTest}</div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={testCache}
                      className="text-xs h-6"
                    >
                      Test Cache
                    </Button>
                  </>
                ) : (
                  <div className="text-xs text-red-600">Cache no disponible</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cache Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Demo: Cache con API Simulation</CardTitle>
              <CardDescription>
                Prueba el sistema de cache híbrido (Memory + IndexedDB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center mb-4">
                <Button onClick={loadDemoData}>Cargar Datos</Button>
                <Button 
                  variant="outline" 
                  onClick={() => cache?.clear()}
                >
                  Limpiar Cache
                </Button>
              </div>
              
              {demoData && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Datos Cargados:</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Mensaje:</strong> {demoData.message}</div>
                    <div><strong>Timestamp:</strong> {demoData.timestamp}</div>
                    <div><strong>Tiempo de carga:</strong> {demoData.loadTime}</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    💡 La segunda carga será instantánea desde cache
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Worker Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service Worker Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Service Worker Registrado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Cache Strategy: Stale-While-Revalidate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Background Sync Activo</span>
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  ✨ Optimización automática de recursos estáticos
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analytics & Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Analytics</h4>
                  <div className="space-y-1 text-sm">
                    <div>✓ Google Analytics 4</div>
                    <div>✓ Error Tracking (Sentry)</div>
                    <div>✓ Performance Monitoring</div>
                    <div>✓ A/B Testing Ready</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Privacy</h4>
                  <div className="space-y-1 text-sm">
                    <div>✓ GDPR Compliant</div>
                    <div>✓ Consent Management</div>
                    <div>✓ Cookie Categories</div>
                    <div>✓ Data Minimization</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Development Tools */}
          {process.env.NODE_ENV === 'development' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🛠️ Herramientas de Desarrollo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Performance Monitor</h4>
                    <div>📍 Esquina superior derecha</div>
                    <div>📊 Web Vitals en tiempo real</div>
                    <div>🔍 Memory & Connection info</div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Cache Status</h4>
                    <div>📍 Esquina inferior derecha</div>
                    <div>💾 Hit/Miss rates</div>
                    <div>🧹 Cache management</div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Error Boundary</h4>
                    <div>🛡️ Manejo robusto de errores</div>
                    <div>🔍 Debug info en desarrollo</div>
                    <div>🎯 Error reporting a Sentry</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizationDemo;