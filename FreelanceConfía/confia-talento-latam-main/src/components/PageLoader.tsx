import React from 'react';

interface PageLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = 'Cargando...', 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[50vh] ${className}`}>
      {/* Spinner */}
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}></div>
      </div>
      
      {/* Loading text */}
      <p className={`mt-4 text-gray-600 ${textSizeClasses[size]} font-medium`}>
        {message}
      </p>
      
      {/* Progress dots */}
      <div className="flex space-x-1 mt-2">
        <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"></div>
        <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default PageLoader;