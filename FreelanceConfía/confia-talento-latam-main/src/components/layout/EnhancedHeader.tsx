import React, { useState, useRef, useEffect } from 'react';
import { useAccessibility } from '@/hooks/use-accessibility';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  User, 
  Settings,
  Home,
  Briefcase,
  MessageSquare,
  DollarSign,
  BarChart3,
  HelpCircle,
  Shield,
  ChevronDown,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavigationItem[];
  description?: string;
}

interface EnhancedHeaderProps {
  className?: string;
  user?: {
    name: string;
    avatar?: string;
    type: 'freelancer' | 'client';
    unreadNotifications: number;
  };
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Inicio',
    href: '/',
    icon: <Home className="h-4 w-4" />,
    description: 'Página principal de FreelanceConfía'
  },
  {
    id: 'projects',
    label: 'Proyectos',
    href: '/projects',
    icon: <Briefcase className="h-4 w-4" />,
    description: 'Buscar y gestionar proyectos',
    children: [
      {
        id: 'browse-projects',
        label: 'Buscar Proyectos',
        href: '/projects/browse',
        icon: <Search className="h-4 w-4" />,
        description: 'Explora proyectos disponibles'
      },
      {
        id: 'my-projects',
        label: 'Mis Proyectos',
        href: '/projects/my',
        icon: <Briefcase className="h-4 w-4" />,
        description: 'Proyectos en los que participas'
      },
      {
        id: 'create-project',
        label: 'Crear Proyecto',
        href: '/projects/create',
        icon: <Briefcase className="h-4 w-4" />,
        description: 'Publica un nuevo proyecto'
      }
    ]
  },
  {
    id: 'messages',
    label: 'Mensajes',
    href: '/messages',
    icon: <MessageSquare className="h-4 w-4" />,
    description: 'Chat y comunicación'
  },
  {
    id: 'payments',
    label: 'Pagos',
    href: '/payments',
    icon: <DollarSign className="h-4 w-4" />,
    description: 'Gestionar pagos y transacciones'
  },
  {
    id: 'analytics',
    label: 'Estadísticas',
    href: '/analytics',
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'Análisis y reportes'
  }
];

export const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({ 
  className,
  user 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { settings, announceToScreenReader } = useAccessibility();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + S to focus search
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        searchInputRef.current?.focus();
        announceToScreenReader('Campo de búsqueda enfocado');
      }
      
      // Alt + M to toggle mobile menu
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        setMobileMenuOpen(!mobileMenuOpen);
        announceToScreenReader(
          mobileMenuOpen ? 'Menú móvil cerrado' : 'Menú móvil abierto'
        );
      }
      
      // Escape to close mobile menu
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        announceToScreenReader('Menú móvil cerrado');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, announceToScreenReader]);

  const handleSkipToContent = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
      announceToScreenReader('Saltando al contenido principal');
    }
  };

  const renderNavigationItem = (item: NavigationItem, isMobile = false) => {
    if (item.children) {
      return (
        <NavigationMenuItem key={item.id}>
          <NavigationMenuTrigger 
            className={cn(
              "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
              settings.keyboardNavigation && "focus-indicator"
            )}
            aria-label={`${item.label} - ${item.description}`}
          >
            {item.icon}
            <span className="ml-2">{item.label}</span>
            <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {item.children.map((child) => (
                <NavigationMenuLink key={child.id} asChild>
                  <a
                    href={child.href}
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      settings.keyboardNavigation && "focus-indicator"
                    )}
                    aria-label={child.description}
                  >
                    <div className="flex items-center gap-2">
                      {child.icon}
                      <div className="text-sm font-medium leading-none">
                        {child.label}
                      </div>
                      {child.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {child.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      {child.description}
                    </p>
                  </a>
                </NavigationMenuLink>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      );
    }

    return (
      <NavigationMenuItem key={item.id}>
        <NavigationMenuLink asChild>
          <a
            href={item.href}
            className={cn(
              "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50",
              settings.keyboardNavigation && "focus-indicator"
            )}
            aria-label={item.description}
          >
            {item.icon}
            <span className="ml-2">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-2">
                {item.badge}
              </Badge>
            )}
          </a>
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  };

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      {/* Skip to content link */}
      {settings.keyboardNavigation && (
        <a
          ref={skipLinkRef}
          href="#main-content"
          onClick={handleSkipToContent}
          className="skip-to-content sr-only-focusable"
          tabIndex={1}
        >
          Saltar al contenido principal
        </a>
      )}

      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <a 
            href="/" 
            className={cn(
              "mr-6 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-md px-2 py-1",
              settings.keyboardNavigation && "focus-indicator"
            )}
            aria-label="FreelanceConfía - Página principal"
          >
            <Shield className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              FreelanceConfía
            </span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => renderNavigationItem(item))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Search Bar */}
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-lg relative">
            <Search className={cn(
              "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
              searchFocused && "text-primary"
            )} />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Buscar proyectos, freelancers..."
              className={cn(
                "w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                settings.keyboardNavigation && "focus-indicator"
              )}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              aria-label="Buscar en FreelanceConfía"
              aria-describedby="search-help"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              Alt+S
            </kbd>
            <div id="search-help" className="sr-only">
              Busca proyectos, freelancers, o cualquier contenido en la plataforma. 
              Usa Alt+S para enfocar rápidamente.
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className={cn(
                  "h-9 w-9",
                  settings.keyboardNavigation && "focus-indicator"
                )}
                aria-label="Seleccionar idioma"
              >
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Idioma</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="mr-2">🇪🇸</span> Español
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">🇺🇸</span> English
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="mr-2">🇧🇷</span> Português
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          {user && (
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "relative h-9 w-9",
                settings.keyboardNavigation && "focus-indicator"
              )}
              aria-label={`Notificaciones${user.unreadNotifications > 0 ? ` - ${user.unreadNotifications} sin leer` : ''}`}
            >
              <Bell className="h-4 w-4" />
              {user.unreadNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  aria-hidden="true"
                >
                  {user.unreadNotifications > 99 ? '99+' : user.unreadNotifications}
                </Badge>
              )}
            </Button>
          )}

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "relative h-8 w-8 rounded-full",
                    settings.keyboardNavigation && "focus-indicator"
                  )}
                  aria-label={`Menú de usuario - ${user.name}`}
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {user.type}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Accesibilidad</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Ayuda</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                Iniciar Sesión
              </Button>
              <Button size="sm">
                Registrarse
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "md:hidden h-9 w-9",
              settings.keyboardNavigation && "focus-indicator"
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="md:hidden border-t bg-background"
          role="navigation"
          aria-label="Menú de navegación móvil"
        >
          <div className="container py-4 space-y-2">
            {navigationItems.map((item) => (
              <div key={item.id}>
                <a
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none transition-colors",
                    settings.keyboardNavigation && "focus-indicator"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={item.description}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </a>
                {item.children && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <a
                        key={child.id}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none transition-colors",
                          settings.keyboardNavigation && "focus-indicator"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label={child.description}
                      >
                        {child.icon}
                        <span>{child.label}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      {settings.keyboardNavigation && (
        <div className="sr-only" role="region" aria-label="Atajos de teclado disponibles">
          <h3>Atajos de teclado:</h3>
          <ul>
            <li>Alt + S: Enfocar búsqueda</li>
            <li>Alt + M: Abrir/cerrar menú móvil</li>
            <li>Tab: Navegar por elementos</li>
            <li>Enter/Espacio: Activar elemento enfocado</li>
            <li>Escape: Cerrar menús desplegables</li>
          </ul>
        </div>
      )}
    </header>
  );
};