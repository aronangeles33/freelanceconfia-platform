import React, { useState, useEffect } from 'react';
import { 
  usePerformanceMonitor, 
  useConnectionMonitor, 
  useMemoryMonitor 
} from '../hooks/use-performance';

interface PerformanceMonitorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  position = 'top-right',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const webVitals = usePerformanceMonitor();
  const connectionInfo = useConnectionMonitor();
  const memoryUsage = useMemoryMonitor();
  const [performanceEntries, setPerformanceEntries] = useState<PerformanceEntry[]>([]);

  // Only show in development
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development');
    
      // Get performance entries
      if (typeof window !== 'undefined' && window.performance) {
        const updatePerformanceEntries = () => {
          const entries: PerformanceEntry[] = [
            ...Array.from(window.performance.getEntriesByType('navigation')),
            ...Array.from(window.performance.getEntriesByType('resource')),
            ...Array.from(window.performance.getEntriesByType('measure'))
          ];
          setPerformanceEntries(entries.slice(-10)); // Keep last 10 entries
        };      updatePerformanceEntries();
      
      // Update every 5 seconds
      const interval = setInterval(updatePerformanceEntries, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  if (!isVisible) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatMs = (ms: number) => {
    return `${ms.toFixed(1)}ms`;
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; needs: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.needs) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
        {/* Header */}
        <div 
          className="p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50/50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Performance</span>
          </div>
          <svg 
            className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-3 pt-0 border-t border-gray-100 max-w-xs">
            {/* Connection */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                Connection
              </h4>
              <div className="text-sm text-gray-700">
                <span className="capitalize">{connectionInfo.effectiveType || 'Unknown'}</span>
                {connectionInfo.downlink && (
                  <span className="text-gray-500 ml-1">
                    ({connectionInfo.downlink} Mbps)
                  </span>
                )}
              </div>
            </div>

            {/* Memory Usage */}
            {memoryUsage && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Memory
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Used:</span>
                    <span className="text-gray-700">
                      {formatBytes(memoryUsage.usedJSHeapSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="text-gray-700">
                      {formatBytes(memoryUsage.totalJSHeapSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Limit:</span>
                    <span className="text-gray-700">
                      {formatBytes(memoryUsage.jsHeapSizeLimit)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Web Vitals */}
            {webVitals && (webVitals.LCP > 0 || webVitals.FID > 0 || webVitals.CLS > 0 || webVitals.TTFB > 0) && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Web Vitals
                </h4>
                <div className="space-y-1 text-sm">
                  {webVitals.LCP > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">LCP:</span>
                      <span className={getPerformanceColor(webVitals.LCP, { good: 2500, needs: 4000 })}>
                        {formatMs(webVitals.LCP)}
                      </span>
                    </div>
                  )}
                  {webVitals.FID > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">FID:</span>
                      <span className={getPerformanceColor(webVitals.FID, { good: 100, needs: 300 })}>
                        {formatMs(webVitals.FID)}
                      </span>
                    </div>
                  )}
                  {webVitals.CLS > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">CLS:</span>
                      <span className={getPerformanceColor(webVitals.CLS * 1000, { good: 100, needs: 250 })}>
                        {webVitals.CLS.toFixed(3)}
                      </span>
                    </div>
                  )}
                  {webVitals.TTFB > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">TTFB:</span>
                      <span className={getPerformanceColor(webVitals.TTFB, { good: 800, needs: 1800 })}>
                        {formatMs(webVitals.TTFB)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Performance Entries */}
            {performanceEntries.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Recent Entries
                </h4>
                <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                  {performanceEntries.slice(-5).map((entry, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600 truncate" title={entry.name}>
                        {entry.name.split('/').pop() || entry.name}
                      </span>
                      <span className="text-gray-700 ml-1">
                        {formatMs(entry.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="flex justify-between text-xs">
                <span className="text-green-600">● Good</span>
                <span className="text-yellow-600">● Needs Improvement</span>
                <span className="text-red-600">● Poor</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;