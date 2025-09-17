import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, User, ChevronDown, LogOut, Settings, Shield, Smartphone, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/notifications/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 transition-smooth">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">FC</span>
            </div>
            <span className="text-xl font-bold text-gradient">FreelanceConfía</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/projects" className="text-foreground hover:text-primary transition-smooth">
              Proyectos
            </Link>
            <Link to="/categories" className="text-foreground hover:text-primary transition-smooth">
              Categorías
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-smooth">
              Nosotros
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-smooth">
              Contacto
            </Link>
            <Link to="/testing" className="text-foreground hover:text-primary transition-smooth">
              Testing
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar proyectos..."
                className="pl-10 bg-muted/50 border-0 focus:bg-white focus:shadow-md transition-smooth"
              />
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Notificaciones */}
                <NotificationBell />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-primary/10">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:block">{user.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/security" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Seguridad
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/escrow" className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pagos Escrow
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/pwa-settings" className="cursor-pointer">
                        <Smartphone className="mr-2 h-4 w-4" />
                        App Móvil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" className="hover:bg-primary/10" asChild>
                  <Link to="/login">Iniciar Sesión</Link>
                </Button>
                <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-smooth" asChild>
                  <Link to="/register">Registrarse</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-smooth"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border mt-2 py-4 space-y-4 animate-fade-in-up">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar proyectos..."
                className="pl-10 bg-muted/50 border-0"
              />
            </div>
            <nav className="flex flex-col space-y-4">
              <Link to="/projects" className="text-foreground hover:text-primary transition-smooth">
                Proyectos
              </Link>
              <Link to="/categories" className="text-foreground hover:text-primary transition-smooth">
                Categorías
              </Link>
              <Link to="/about" className="text-foreground hover:text-primary transition-smooth">
                Nosotros
              </Link>
              <Link to="/contact" className="text-foreground hover:text-primary transition-smooth">
                Contacto
              </Link>
            </nav>
            <div className="flex flex-col space-y-2 pt-4 border-t border-border">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center space-x-3 px-2 py-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/dashboard">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      Perfil
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/escrow">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pagos Escrow
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/pwa-settings">
                      <Smartphone className="mr-2 h-4 w-4" />
                      App Móvil
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start text-red-600" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/login">
                      <User className="mr-2 h-4 w-4" />
                      Iniciar Sesión
                    </Link>
                  </Button>
                  <Button className="bg-gradient-to-r from-primary to-secondary" asChild>
                    <Link to="/register">Registrarse Gratis</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;