import React, { useState, useEffect } from 'react';
import { useCache } from './cache/CacheProvider';

interface CacheStatusProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

const CacheStatus: React.FC<CacheStatusProps> = ({
  position = 'bottom-right',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    totalSize: 0,
    hitRate: 0,
    itemCount: 0,
    missRate: 0,
    compressionRatio: 0
  });
  
  const cache = useCache();

  // Only show in development
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development');
  }, []);

  // Update cache stats
  useEffect(() => {
    if (!isVisible || !cache) return;

    const updateStats = () => {
      const stats = cache.getStats();
      setCacheStats(stats);
    };

    updateStats();
    
    // Update every 2 seconds
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, [isVisible, cache]);

  if (!isVisible || !cache) return null;

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

  const hitRateColor = () => {
    if (cacheStats.hitRate >= 0.8) return 'text-green-600';
    if (cacheStats.hitRate >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleClearCache = async () => {
    try {
      await cache.clear();
      setCacheStats({
        totalSize: 0,
        hitRate: 0,
        itemCount: 0,
        missRate: 0,
        compressionRatio: 0
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
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
            <div className={`w-2 h-2 rounded-full ${cacheStats.hitRate > 0.5 ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
            <span className="text-sm font-medium text-gray-700">Cache</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${hitRateColor()} bg-gray-100`}>
              {(cacheStats.hitRate * 100).toFixed(1)}%
            </span>
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
            {/* Cache Stats */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                Statistics
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="text-gray-700">
                    {cacheStats.totalSize}KB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="text-gray-700">
                    {cacheStats.itemCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hit Rate:</span>
                  <span className={hitRateColor()}>
                    {(cacheStats.hitRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Miss Rate:</span>
                  <span className="text-red-600">
                    {(cacheStats.missRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Compression:</span>
                  <span className="text-blue-600">
                    {(cacheStats.compressionRatio * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Cache Actions */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                Actions
              </h4>
              <div className="flex space-x-2">
                <button
                  onClick={handleClearCache}
                  className="flex-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Clear Cache
                </button>
              </div>
            </div>

            {/* Cache Health Indicators */}
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                Health
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className={`w-2 h-2 mx-auto mb-1 rounded-full ${cacheStats.hitRate >= 0.8 ? 'bg-green-500' : cacheStats.hitRate >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-600">Hit Rate</span>
                </div>
                <div className="text-center">
                  <div className={`w-2 h-2 mx-auto mb-1 rounded-full ${cacheStats.totalSize < 10240 ? 'bg-green-500' : cacheStats.totalSize < 51200 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-600">Size</span>
                </div>
                <div className="text-center">
                  <div className={`w-2 h-2 mx-auto mb-1 rounded-full ${cacheStats.itemCount < 1000 ? 'bg-green-500' : cacheStats.itemCount < 5000 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <span className="text-gray-600">Items</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 text-center">
                Cache Strategy: Hybrid (Memory + IndexedDB)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CacheStatus;