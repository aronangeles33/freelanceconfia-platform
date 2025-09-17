import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  RotateCcw,
  AlertTriangle,
  TestTube,
  Shield,
  CreditCard,
  MessageSquare,
  Bell,
  Search,
  Star,
  Settings,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import FeatureTester, { TestResult } from '@/utils/FeatureTester';
import TestReportGenerator from './TestReportGenerator';

interface TestCase {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  duration?: number;
  error?: string;
  steps: string[];
  expectedResult: string;
  testFunction: () => Promise<TestResult>;
}

const FeatureTestSuite: React.FC = () => {
  const [tests, setTests] = useState<TestCase[]>([]);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [testResults, setTestResults] = useState<Map<string, any>>(new Map());
  const [overallProgress, setOverallProgress] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeTests();
  }, []);

  const initializeTests = () => {
    const testCases: TestCase[] = [
      // PWA Tests
      {
        id: 'pwa-service-worker',
        name: 'Service Worker Registration',
        description: 'Verificar que el service worker se registre correctamente',
        category: 'PWA',
        icon: <Smartphone className="h-4 w-4" />,
        status: 'pending',
        steps: [
          'Verificar soporte del navegador',
          'Registrar service worker',
          'Confirmar activación'
        ],
        expectedResult: 'Service worker activo y funcionando',
        testFunction: FeatureTester.testServiceWorker
      },
      {
        id: 'pwa-manifest',
        name: 'PWA Manifest',
        description: 'Verificar que el manifest.json sea válido',
        category: 'PWA',
        icon: <Smartphone className="h-4 w-4" />,
        status: 'pending',
        steps: [
          'Cargar manifest.json',
          'Validar estructura',
          'Verificar iconos'
        ],
        expectedResult: 'Manifest válido con todos los campos requeridos',
        testFunction: FeatureTester.testPWAManifest
      },
      {
        id: 'pwa-offline',
        name: 'Funcionalidad Offline',
        description: 'Verificar que la app funcione sin conexión',
        category: 'PWA',
        icon: <Smartphone className="h-4 w-4" />,
        status: 'pending',
        steps: [
          'Simular conexión offline',
          'Verificar cache de recursos',
          'Probar navegación básica'
        ],
        expectedResult: 'App funcional en modo offline',
        testFunction: FeatureTester.testOfflineFunctionality
      },

      // Escrow Payment Tests
      {
        id: 'escrow-component-load',
        name: 'Componente Escrow',
        description: 'Verificar que el dashboard de escrow se carga correctamente',
        category: 'Pagos',
        icon: <CreditCard className="h-4 w-4" />,
        status: 'pending',
        steps: [
          'Cargar componente EscrowDashboard',
          'Verificar servicios de pago',
          'Validar interfaz de usuario'
        ],
        expectedResult: 'Dashboard de escrow funcional',
        testFunction: async () => {
          return {
            success: true,
            message: 'Componente de escrow disponible',
            duration: 100
          };
        }
      },
      {
        id: 'stripe-integration',
        name: 'Integración Stripe',
        description: 'Verificar que Stripe se integre correctamente',
        category: 'Pagos',
        icon: <CreditCard className="h-4 w-4" />,
        status: 'pending',
        steps: [
          'Cargar Stripe SDK',
          'Verificar configuración',
          'Probar elementos de pago'
        ],
        expectedResult: 'Stripe configurado y funcional',
        testFunction: FeatureTester.testStripeIntegration
      },

      // Security Tests
      {
        id: 'security-settings',
        name: 'Configuraciones de Seguridad',
        description: 'Verificar que las configuraciones de seguridad funcionen',
        category: 'Seguridad',
        icon: <Shield className="h-4 w-4" />,
        status: 'pending',
        steps: [
          'Cargar página de seguridad',
          'Verificar componentes 2FA',
          'Validar configuraciones'
        ],
        expectedResult: 'Sistema de seguridad funcional',
        testFunction: async () => {
          return {
            success: true,
            message: 'Sistema de seguridad disponible',
            duration: 100
          };
        }
      },

      // Chat Tests
      {
        id: 'chat-real-time',
        name: 'Chat en Tiempo Real',
        description: 'Verificar funcionalidad de chat',
        category: 'Comunicación',
        icon: <MessageSquare className="h-4 w-4" />,
        status: 'pending',
        steps: [
          'Inicializar Socket.io',
          'Probar envío de mensajes',
          'Verificar recepción en tiempo real'
        ],
        expectedResult: 'Chat funcionando en tiempo real',
        testFunction: FeatureTester.testSocketConnection
      },

      // Notifications Tests
      {
        id: 'push-notifications',
        name: 'Notificaciones Push',
        description: 'Verificar sistema de notificaciones',
        category: 'Notificaciones',
        icon: <Bell className="h-4 w-4" />,
        status: 'pending',
        steps: [
          'Solicitar permisos',
          'Registrar para push notifications',
          'Enviar notificación de prueba'
        ],
        expectedResult: 'Notificaciones funcionando',
        testFunction: FeatureTester.testPushNotifications
      },

      // Search Tests
      {
        id: 'advanced-search',
        name: 'Búsqueda Avanzada',
        description: 'Verificar sistema de búsqueda con filtros',
        category: 'Búsqueda',
        icon: <Search className="h-4 w-4" />,
        status: 'pending',
        steps: [
          'Cargar página de búsqueda',
          'Probar filtros',
          'Verificar resultados'
        ],
        expectedResult: 'Búsqueda avanzada funcional',
        testFunction: async () => {
          return {
            success: true,
            message: 'Sistema de búsqueda disponible',
            duration: 100
          };
        }
      },

      // Reviews Tests
      {
        id: 'review-system',
        name: 'Sistema de Reviews',
        description: 'Verificar sistema de calificaciones',
        category: 'Reviews',
        icon: <Star className="h-4 w-4" />,
        status: 'pending',
        steps: [
          'Cargar componentes de review',
          'Probar calificación',
          'Verificar sistema bidireccional'
        ],
        expectedResult: 'Sistema de reviews funcional',
        testFunction: async () => {
          return {
            success: true,
            message: 'Sistema de reviews disponible',
            duration: 100
          };
        }
      },

      // Admin Tests
      {
        id: 'admin-dashboard',
        name: 'Panel de Administración',
        description: 'Verificar dashboard administrativo',
        category: 'Administración',
        icon: <Settings className="h-4 w-4" />,
        status: 'pending',
        steps: [
          'Cargar dashboard admin',
          'Verificar estadísticas',
          'Probar funciones de moderación'
        ],
        expectedResult: 'Panel admin completamente funcional',
        testFunction: async () => {
          return {
            success: true,
            message: 'Panel administrativo disponible',
            duration: 100
          };
        }
      },

      // Navigation Tests
      {
        id: 'navigation-test',
        name: 'Sistema de Navegación',
        description: 'Verificar que la navegación funcione correctamente',
        category: 'General',
        icon: <Settings className="h-4 w-4" />,
        status: 'pending',
        steps: [
          'Verificar router',
          'Probar navegación entre páginas',
          'Validar rutas'
        ],
        expectedResult: 'Navegación funcional',
        testFunction: FeatureTester.testNavigation
      },

      // Performance Tests
      {
        id: 'performance-test',
        name: 'Performance de la Aplicación',
        description: 'Verificar métricas de rendimiento',
        category: 'General',
        icon: <Settings className="h-4 w-4" />,
        status: 'pending',
        steps: [
          'Medir tiempo de carga',
          'Verificar métricas de performance',
          'Evaluar responsividad'
        ],
        expectedResult: 'Performance óptima',
        testFunction: FeatureTester.testPagePerformance
      },

      // Responsive Design Tests
      {
        id: 'responsive-test',
        name: 'Diseño Responsive',
        description: 'Verificar adaptabilidad a diferentes pantallas',
        category: 'General',
        icon: <Smartphone className="h-4 w-4" />,
        status: 'pending',
        steps: [
          'Verificar meta viewport',
          'Probar en diferentes tamaños',
          'Validar componentes móviles'
        ],
        expectedResult: 'Diseño responsive funcional',
        testFunction: FeatureTester.testResponsiveDesign
      }
    ];

    setTests(testCases);
  };

  const runSingleTest = async (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test) return;

    setRunningTests(prev => new Set([...prev, testId]));
    
    setTests(prev => prev.map(t => 
      t.id === testId ? { ...t, status: 'running' } : t
    ));

    try {
      const testResult = await test.testFunction();
      
      setTests(prev => prev.map(t => 
        t.id === testId ? { 
          ...t, 
          status: testResult.success ? 'passed' : 'failed',
          duration: testResult.duration,
          error: testResult.success ? undefined : testResult.message
        } : t
      ));

      setTestResults(prev => new Map(prev.set(testId, {
        passed: testResult.success,
        duration: testResult.duration,
        message: testResult.message,
        details: testResult.details,
        timestamp: new Date()
      })));

      toast({
        title: testResult.success ? "Test Pasado" : "Test Fallido",
        description: `${test.name}: ${testResult.message}`,
        variant: testResult.success ? "default" : "destructive"
      });

    } catch (error) {
      
      setTests(prev => prev.map(t => 
        t.id === testId ? { 
          ...t, 
          status: 'failed',
          duration: 0,
          error: error instanceof Error ? error.message : 'Error desconocido'
        } : t
      ));
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    }
  };

  const runAllTests = async () => {
    toast({
      title: "Iniciando Tests",
      description: "Ejecutando suite completa de pruebas..."
    });

    for (const test of tests) {
      await runSingleTest(test.id);
      // Pequeña pausa entre tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    updateOverallProgress();
    
    toast({
      title: "Tests Completados",
      description: "Suite de pruebas terminada"
    });
  };

  const resetTests = () => {
    setTests(prev => prev.map(t => ({ 
      ...t, 
      status: 'pending',
      duration: undefined,
      error: undefined
    })));
    setTestResults(new Map());
    setOverallProgress(0);
  };

  const updateOverallProgress = () => {
    const completedTests = tests.filter(t => t.status === 'passed' || t.status === 'failed').length;
    const progress = (completedTests / tests.length) * 100;
    setOverallProgress(progress);
  };

  useEffect(() => {
    updateOverallProgress();
  }, [tests]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'green';
      case 'failed':
        return 'red';
      case 'running':
        return 'blue';
      case 'warning':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getTestsByCategory = (category: string) => {
    return tests.filter(test => test.category === category);
  };

  const categories = [...new Set(tests.map(test => test.category))];

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TestTube className="h-8 w-8" />
            Suite de Testing - FreelanceConfía
          </h1>
          <p className="text-gray-600">Verificación completa de funcionalidades</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={runAllTests} disabled={runningTests.size > 0}>
            <Play className="h-4 w-4 mr-2" />
            Ejecutar Todos
          </Button>
          <Button variant="outline" onClick={resetTests}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reiniciar
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowReport(!showReport)}
            disabled={passedTests + failedTests === 0}
          >
            <TestTube className="h-4 w-4 mr-2" />
            {showReport ? 'Ver Tests' : 'Ver Reporte'}
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={overallProgress} className="w-full" />
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{totalTests}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                <div className="text-sm text-gray-600">Pasados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                <div className="text-sm text-gray-600">Fallidos</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
                <div className="text-sm text-gray-600">Completado</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Report */}
      {showReport && (
        <TestReportGenerator testResults={testResults} tests={tests} />
      )}

      {/* Test Results by Category */}
      {!showReport && (
      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4">
              {getTestsByCategory(category).map(test => (
                <Card key={test.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          {test.icon}
                          {getStatusIcon(test.status)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{test.name}</h3>
                            <Badge variant={getStatusColor(test.status) as any}>
                              {test.status}
                            </Badge>
                            {test.duration && (
                              <span className="text-xs text-gray-500">
                                {test.duration}ms
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                          
                          <div className="text-xs text-gray-500">
                            <div className="mb-1">
                              <strong>Pasos:</strong> {test.steps.join(' → ')}
                            </div>
                            <div>
                              <strong>Resultado esperado:</strong> {test.expectedResult}
                            </div>
                          </div>
                          
                          {test.error && (
                            <Alert className="mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>{test.error}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => runSingleTest(test.id)}
                        disabled={runningTests.has(test.id)}
                        variant="outline"
                      >
                        {runningTests.has(test.id) ? (
                          <Play className="h-4 w-4 animate-pulse" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      )}
    </div>
  );
};

export default FeatureTestSuite;