import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  webpSrc?: string;
  avifSrc?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

interface ImageFormat {
  src: string;
  type: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  webpSrc,
  avifSrc,
  sizes = '100vw',
  loading = 'lazy',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  className,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(priority);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Determine best image format
  useEffect(() => {
    if (!isInView) return;

    const formats: ImageFormat[] = [];
    
    // Add AVIF if supported and provided
    if (avifSrc && supportsAvif()) {
      formats.push({ src: avifSrc, type: 'image/avif' });
    }
    
    // Add WebP if supported and provided
    if (webpSrc && supportsWebP()) {
      formats.push({ src: webpSrc, type: 'image/webp' });
    }
    
    // Add original format as fallback
    formats.push({ src, type: getImageType(src) });

    // Use the best supported format
    setCurrentSrc(formats[0].src);
  }, [isInView, src, webpSrc, avifSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setIsError(true);
    if (onError) onError();
  };

  const supportsWebP = (): boolean => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch {
      return false;
    }
  };

  const supportsAvif = (): boolean => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch {
      return false;
    }
  };

  const getImageType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'svg':
        return 'image/svg+xml';
      default:
        return 'image/jpeg';
    }
  };

  const generateSrcSet = (): string => {
    if (!currentSrc) return '';
    
    const baseSrc = currentSrc.replace(/\.[^/.]+$/, '');
    const extension = currentSrc.split('.').pop();
    
    // Generate responsive sizes
    const sizes = [320, 640, 768, 1024, 1280, 1920];
    return sizes
      .map(size => `${baseSrc}_${size}w.${extension} ${size}w`)
      .join(', ');
  };

  // Show placeholder while loading or if not in view
  if (!isInView || (!isLoaded && !isError)) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${className || ''}`}
        style={{
          width: props.width || '100%',
          height: props.height || '200px',
          ...props.style
        }}
        aria-label={`Loading ${alt}`}
      >
        {placeholder === 'blur' && blurDataURL ? (
          <img
            src={blurDataURL}
            alt=""
            className="w-full h-full object-cover filter blur-sm"
            aria-hidden="true"
          />
        ) : (
          <div className="text-gray-400 text-sm">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Cargando...
          </div>
        )}
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div
        className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center ${className || ''}`}
        style={{
          width: props.width || '100%',
          height: props.height || '200px',
          ...props.style
        }}
        role="img"
        aria-label={`Error cargando imagen: ${alt}`}
      >
        <div className="text-gray-500 text-center">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm">Error al cargar imagen</p>
        </div>
      </div>
    );
  }

  // Render optimized image
  return (
    <picture>
      {/* AVIF format (best compression) */}
      {avifSrc && (
        <source
          srcSet={avifSrc}
          type="image/avif"
          sizes={sizes}
        />
      )}
      
      {/* WebP format (good compression, wide support) */}
      {webpSrc && (
        <source
          srcSet={webpSrc}
          type="image/webp"
          sizes={sizes}
        />
      )}
      
      {/* Fallback format */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className || ''}`}
        loading={loading}
        sizes={sizes}
        srcSet={generateSrcSet()}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;

// Helper hook for image optimization
export const useImageOptimization = (originalSrc: string) => {
  const [optimizedSources, setOptimizedSources] = useState({
    webp: '',
    avif: '',
    responsive: [] as string[]
  });

  useEffect(() => {
    // In a real implementation, this would generate optimized versions
    // For now, we'll create the expected URLs
    const baseSrc = originalSrc.replace(/\.[^/.]+$/, '');
    const extension = originalSrc.split('.').pop();

    setOptimizedSources({
      webp: `${baseSrc}.webp`,
      avif: `${baseSrc}.avif`,
      responsive: [320, 640, 768, 1024, 1280, 1920].map(
        size => `${baseSrc}_${size}w.${extension}`
      )
    });
  }, [originalSrc]);

  return optimizedSources;
};

// Preload critical images
export const preloadImage = (src: string, as: 'image' = 'image') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  document.head.appendChild(link);
};

// Prefetch images for next page
export const prefetchImage = (src: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = src;
  document.head.appendChild(link);
};