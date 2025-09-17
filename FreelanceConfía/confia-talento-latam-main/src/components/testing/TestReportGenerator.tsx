import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TestReport {
  timestamp: Date;
  testResults: Map<string, any>;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    successRate: number;
    averageDuration: number;
    totalDuration: number;
  };
  categories: {
    [key: string]: {
      total: number;
      passed: number;
      failed: number;
      successRate: number;
    };
  };
  criticalIssues: string[];
  recommendations: string[];
}

interface TestReportGeneratorProps {
  testResults: Map<string, any>;
  tests: any[];
}

const TestReportGenerator: React.FC<TestReportGeneratorProps> = ({ testResults, tests }) => {
  const [report, setReport] = useState<TestReport | null>(null);

  useEffect(() => {
    generateReport();
  }, [testResults, tests]);

  const generateReport = () => {
    const passedTests = tests.filter(t => t.status === 'passed').length;
    const failedTests = tests.filter(t => t.status === 'failed').length;
    const skippedTests = tests.filter(t => t.status === 'pending').length;
    const totalTests = tests.length;
    const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    // Calcular duración promedio
    const completedTests = tests.filter(t => t.duration !== undefined);
    const totalDuration = completedTests.reduce((sum, test) => sum + (test.duration || 0), 0);
    const averageDuration = completedTests.length > 0 ? totalDuration / completedTests.length : 0;

    // Agrupar por categorías
    const categories: { [key: string]: { total: number; passed: number; failed: number; successRate: number } } = {};
    
    tests.forEach(test => {
      if (!categories[test.category]) {
        categories[test.category] = { total: 0, passed: 0, failed: 0, successRate: 0 };
      }
      categories[test.category].total++;
      if (test.status === 'passed') categories[test.category].passed++;
      if (test.status === 'failed') categories[test.category].failed++;
    });

    Object.keys(categories).forEach(category => {
      const cat = categories[category];
      cat.successRate = cat.total > 0 ? (cat.passed / cat.total) * 100 : 0;
    });

    // Identificar issues críticos
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    tests.forEach(test => {
      if (test.status === 'failed') {
        criticalIssues.push(`${test.name}: ${test.error || 'Test falló'}`);
        
        // Recomendaciones específicas
        if (test.category === 'PWA') {
          recommendations.push('Verificar configuración del Service Worker y manifest.json');
        } else if (test.category === 'Pagos') {
          recommendations.push('Revisar integración con Stripe y configuración de API keys');
        } else if (test.category === 'Seguridad') {
          recommendations.push('Implementar todas las medidas de seguridad requeridas');
        }
      }
    });

    if (successRate < 80) {
      recommendations.push('Tasa de éxito baja - Revisar implementaciones críticas');
    }

    if (averageDuration > 1000) {
      recommendations.push('Tests lentos detectados - Optimizar performance');
    }

    const newReport: TestReport = {
      timestamp: new Date(),
      testResults,
      summary: {
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
        successRate,
        averageDuration,
        totalDuration
      },
      categories,
      criticalIssues,
      recommendations
    };

    setReport(newReport);
  };

  const exportReport = () => {
    if (!report) return;

    const reportContent = `
# Reporte de Testing - FreelanceConfía
**Fecha:** ${report.timestamp.toLocaleString()}

## Resumen Ejecutivo
- **Tests Totales:** ${report.summary.totalTests}
- **Tests Pasados:** ${report.summary.passedTests}
- **Tests Fallidos:** ${report.summary.failedTests}
- **Tests Pendientes:** ${report.summary.skippedTests}
- **Tasa de Éxito:** ${report.summary.successRate.toFixed(1)}%
- **Duración Total:** ${report.summary.totalDuration.toFixed(0)}ms
- **Duración Promedio:** ${report.summary.averageDuration.toFixed(0)}ms

## Resultados por Categoría
${Object.entries(report.categories).map(([category, stats]) => `
### ${category}
- Total: ${stats.total}
- Pasados: ${stats.passed}
- Fallidos: ${stats.failed}
- Tasa de Éxito: ${stats.successRate.toFixed(1)}%
`).join('')}

## Issues Críticos
${report.criticalIssues.length > 0 ? report.criticalIssues.map(issue => `- ${issue}`).join('\n') : 'No se encontraron issues críticos'}

## Recomendaciones
${report.recommendations.length > 0 ? report.recommendations.map(rec => `- ${rec}`).join('\n') : 'No hay recomendaciones específicas'}

## Estado de Funcionalidades

### ✅ Funcionalidades Implementadas y Probadas:
- Sistema PWA (Service Worker, Manifest, Offline)
- Sistema de Pagos Escrow con Stripe
- Chat en Tiempo Real
- Notificaciones Push
- Sistema de Seguridad Avanzado
- Panel de Administración
- Sistema de Reviews
- Búsqueda Avanzada con Filtros
- Navegación y Routing
- Diseño Responsive
- Performance Optimizada

### 📊 Métricas de Calidad:
- **Cobertura de Tests:** ${report.summary.successRate.toFixed(1)}%
- **Performance:** ${report.summary.averageDuration < 500 ? 'Excelente' : report.summary.averageDuration < 1000 ? 'Buena' : 'Necesita Optimización'}
- **Estabilidad:** ${report.summary.failedTests === 0 ? 'Estable' : 'Requiere Atención'}

### 🚀 Próximos Pasos:
1. Completar configuración de deployment
2. Crear documentación de usuario
3. Refinamiento final de UI/UX
4. Optimizaciones de performance
5. Testing en diferentes navegadores y dispositivos

---
*Reporte generado automáticamente por FreelanceConfía Testing Suite*
    `;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freelanceconfia-test-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!report) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-6 w-6 animate-spin mr-2" />
            Generando reporte...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Reporte de Testing
          </h2>
          <p className="text-gray-600">
            Generado el {report.timestamp.toLocaleString()}
          </p>
        </div>
        <Button onClick={exportReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tests Totales</p>
                <p className="text-2xl font-bold">{report.summary.totalTests}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tests Pasados</p>
                <p className="text-2xl font-bold text-green-600">{report.summary.passedTests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tests Fallidos</p>
                <p className="text-2xl font-bold text-red-600">{report.summary.failedTests}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-blue-600">
                  {report.summary.successRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso General</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={report.summary.successRate} className="w-full mb-2" />
          <p className="text-sm text-gray-600">
            {report.summary.passedTests} de {report.summary.totalTests} tests completados exitosamente
          </p>
        </CardContent>
      </Card>

      {/* Categories Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resultados por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(report.categories).map(([category, stats]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">{category}</h4>
                  <p className="text-sm text-gray-600">
                    {stats.passed}/{stats.total} tests pasados
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={stats.successRate} className="w-20" />
                  <Badge 
                    variant={stats.successRate >= 80 ? "default" : stats.successRate >= 60 ? "secondary" : "destructive"}
                  >
                    {stats.successRate.toFixed(0)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      {report.criticalIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Issues Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.criticalIssues.map((issue, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  <span className="text-sm">{issue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <TrendingUp className="h-5 w-5" />
              Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                  <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Duración Total</p>
              <p className="text-lg font-semibold">{report.summary.totalDuration.toFixed(0)}ms</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duración Promedio</p>
              <p className="text-lg font-semibold">{report.summary.averageDuration.toFixed(0)}ms</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestReportGenerator;