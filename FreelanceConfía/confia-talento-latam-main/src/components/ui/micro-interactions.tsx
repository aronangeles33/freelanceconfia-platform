import React, { useState, useRef, useEffect } from 'react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { cn } from '@/lib/utils';

// ==========================================================================
// ENHANCED BUTTON WITH MICRO-INTERACTIONS
// ==========================================================================

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  loadingText?: string;
  successState?: boolean;
  successDuration?: number;
  rippleEffect?: boolean;
  pulseOnFocus?: boolean;
  children: React.ReactNode;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  className,
  variant = 'default',
  size = 'default',
  isLoading = false,
  loadingText = 'Cargando...',
  successState = false,
  successDuration = 2000,
  rippleEffect = true,
  pulseOnFocus = true,
  children,
  onClick,
  disabled,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const { settings, announceToScreenReader } = useAccessibility();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleCounter = useRef(0);

  // Handle success state
  useEffect(() => {
    if (successState) {
      setShowSuccess(true);
      announceToScreenReader('Acción completada exitosamente');
      const timer = setTimeout(() => setShowSuccess(false), successDuration);
      return () => clearTimeout(timer);
    }
  }, [successState, successDuration, announceToScreenReader]);

  // Ripple effect
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!rippleEffect || settings.reducedMotion) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = {
      id: rippleCounter.current++,
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;

    setIsPressed(true);
    createRipple(event);
    setTimeout(() => setIsPressed(false), 150);

    if (onClick) {
      onClick(event);
    }
  };

  const getVariantClasses = () => {
    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline'
    };
    return variants[variant];
  };

  const getSizeClasses = () => {
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10'
    };
    return sizes[size];
  };

  return (
    <button
      ref={buttonRef}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        
        // Variant styles
        getVariantClasses(),
        
        // Size styles
        getSizeClasses(),
        
        // State styles
        isPressed && !settings.reducedMotion && 'transform scale-95',
        (isLoading || showSuccess) && 'cursor-wait',
        pulseOnFocus && settings.keyboardNavigation && 'focus:animate-pulse',
        
        // Accessibility
        settings.keyboardNavigation && 'focus-indicator',
        
        // Custom className
        className
      )}
      disabled={disabled || isLoading}
      onClick={handleClick}
      aria-busy={isLoading}
      aria-live="polite"
      style={{
        position: 'relative',
        overflow: 'hidden'
      }}
      {...props}
    >
      {/* Ripple Effect */}
      {rippleEffect && !settings.reducedMotion && (
        <span className="absolute inset-0 overflow-hidden rounded-md">
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute animate-ping bg-current opacity-30 rounded-full"
              style={{
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20,
                animationDuration: '0.6s'
              }}
            />
          ))}
        </span>
      )}

      {/* Content */}
      <span className="relative flex items-center gap-2">
        {/* Loading State */}
        {isLoading && (
          <>
            <svg
              className={cn(
                "animate-spin h-4 w-4",
                settings.reducedMotion && "animate-none"
              )}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText}
          </>
        )}

        {/* Success State */}
        {showSuccess && !isLoading && (
          <>
            <svg
              className="h-4 w-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            ¡Completado!
          </>
        )}

        {/* Normal State */}
        {!isLoading && !showSuccess && children}
      </span>
    </button>
  );
};

// ==========================================================================
// ENHANCED INPUT WITH MICRO-INTERACTIONS
// ==========================================================================

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  showCharacterCount?: boolean;
  maxLength?: number;
  animateOnFocus?: boolean;
  validateOnBlur?: boolean;
  onValidate?: (value: string) => string | null;
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  className,
  label,
  error,
  success,
  icon,
  showCharacterCount = false,
  maxLength,
  animateOnFocus = true,
  validateOnBlur = true,
  onValidate,
  onFocus,
  onBlur,
  onChange,
  value,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [currentError, setCurrentError] = useState(error);
  const [isValid, setIsValid] = useState(false);
  const { settings, announceToScreenReader } = useAccessibility();
  const inputRef = useRef<HTMLInputElement>(null);

  const characterCount = value ? value.toString().length : 0;

  useEffect(() => {
    setCurrentError(error);
  }, [error]);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    
    if (validateOnBlur && onValidate && value) {
      const validationError = onValidate(value.toString());
      setCurrentError(validationError);
      setIsValid(!validationError);
      
      if (validationError) {
        announceToScreenReader(`Error de validación: ${validationError}`);
      } else if (success) {
        announceToScreenReader(success);
      }
    }
    
    if (onBlur) onBlur(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Clear error when user starts typing
    if (currentError) {
      setCurrentError(null);
      setIsValid(false);
    }
    
    if (onChange) onChange(event);
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label
          htmlFor={props.id}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            currentError && "text-destructive",
            success && !currentError && "text-green-600"
          )}
        >
          {label}
          {props.required && (
            <span className="text-destructive ml-1" aria-label="obligatorio">
              *
            </span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          className={cn(
            // Base styles
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            
            // Icon spacing
            icon && "pl-10",
            
            // State styles
            currentError && "border-destructive focus-visible:ring-destructive",
            success && !currentError && "border-green-600 focus-visible:ring-green-600",
            isValid && !currentError && "border-green-600",
            
            // Animation
            animateOnFocus && isFocused && !settings.reducedMotion && "transform scale-105 transition-transform duration-200",
            
            // Accessibility
            settings.keyboardNavigation && "focus-indicator",
            
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          value={value}
          maxLength={maxLength}
          aria-invalid={!!currentError}
          aria-describedby={cn(
            currentError && `${props.id}-error`,
            success && `${props.id}-success`,
            showCharacterCount && `${props.id}-count`
          )}
          {...props}
        />

        {/* Success Icon */}
        {isValid && !currentError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="h-4 w-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}

        {/* Error Icon */}
        {currentError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="h-4 w-4 text-destructive"
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
          </div>
        )}
      </div>

      {/* Character Count */}
      {showCharacterCount && maxLength && (
        <div
          id={`${props.id}-count`}
          className={cn(
            "text-xs text-right",
            characterCount > maxLength * 0.9 && "text-orange-600",
            characterCount >= maxLength && "text-destructive"
          )}
          aria-live="polite"
        >
          {characterCount} / {maxLength}
        </div>
      )}

      {/* Error Message */}
      {currentError && (
        <p
          id={`${props.id}-error`}
          className="text-sm text-destructive flex items-center gap-1"
          role="alert"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {currentError}
        </p>
      )}

      {/* Success Message */}
      {success && !currentError && (
        <p
          id={`${props.id}-success`}
          className="text-sm text-green-600 flex items-center gap-1"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          {success}
        </p>
      )}
    </div>
  );
};

// ==========================================================================
// ENHANCED CARD WITH HOVER EFFECTS
// ==========================================================================

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
  clickable?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  className,
  hoverEffect = 'lift',
  clickable = false,
  loading = false,
  children,
  onClick,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { settings } = useAccessibility();

  const getHoverEffectClasses = () => {
    if (settings.reducedMotion || hoverEffect === 'none') return '';

    const effects = {
      lift: 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300',
      glow: 'hover:shadow-xl hover:shadow-primary/25 transition-shadow duration-300',
      scale: 'hover:scale-105 transition-transform duration-300',
      none: ''
    };

    return effects[hoverEffect];
  };

  return (
    <div
      className={cn(
        // Base styles
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        
        // Hover effects
        getHoverEffectClasses(),
        
        // Clickable styles
        clickable && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        
        // Loading state
        loading && "animate-pulse",
        
        // Accessibility
        settings.keyboardNavigation && clickable && "focus-indicator",
        
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...props}
    >
      {loading ? (
        <div className="p-6 space-y-3">
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
        </div>
      ) : (
        children
      )}
      
      {/* Hover indicator for clickable cards */}
      {clickable && isHovered && !settings.reducedMotion && (
        <div className="absolute top-2 right-2 opacity-60">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

// ==========================================================================
// LOADING STATES
// ==========================================================================

interface LoadingSkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  width = '100%',
  height = '1rem',
  rounded = true
}) => {
  const { settings } = useAccessibility();

  return (
    <div
      className={cn(
        "bg-muted",
        !settings.reducedMotion && "animate-pulse",
        rounded && "rounded",
        className
      )}
      style={{ width, height }}
      aria-label="Cargando contenido"
      role="status"
    />
  );
};

// ==========================================================================
// PROGRESS INDICATOR WITH ANIMATIONS
// ==========================================================================

interface EnhancedProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'destructive';
  animated?: boolean;
}

export const EnhancedProgress: React.FC<EnhancedProgressProps> = ({
  value,
  max = 100,
  showLabel = true,
  label,
  size = 'md',
  color = 'primary',
  animated = true
}) => {
  const { settings, announceToScreenReader } = useAccessibility();
  const percentage = Math.round((value / max) * 100);

  useEffect(() => {
    if (percentage === 100) {
      announceToScreenReader('Progreso completado');
    }
  }, [percentage, announceToScreenReader]);

  const getSizeClasses = () => {
    const sizes = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    };
    return sizes[size];
  };

  const getColorClasses = () => {
    const colors = {
      primary: 'bg-primary',
      success: 'bg-green-600',
      warning: 'bg-yellow-600',
      destructive: 'bg-destructive'
    };
    return colors[color];
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-sm">
          <span>{label || 'Progreso'}</span>
          <span>{percentage}%</span>
        </div>
      )}

      {/* Progress Bar */}
      <div
        className={cn(
          "w-full bg-muted rounded-full overflow-hidden",
          getSizeClasses()
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progreso: ${percentage}%`}
      >
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            getColorClasses(),
            animated && !settings.reducedMotion && percentage === 100 && "animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};