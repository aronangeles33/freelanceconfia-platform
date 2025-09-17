import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, Users, Briefcase, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { handleApiError } from "@/lib/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, isAuthenticated } = useAuth();
  const [userType, setUserType] = useState<"freelancer" | "company">("freelancer");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptNewsletter: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Redirigir si ya está autenticado
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Error",
        description: "Debes aceptar los términos y condiciones.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: userType
      });

      toast({
        title: "¡Registro exitoso!",
        description: `Bienvenido a FreelanceConfía. Te hemos enviado un email de verificación.`,
      });

      // Redirigir al dashboard después del registro exitoso
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error en el registro",
        description: handleApiError(error),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = {
    freelancer: [
      "Acceso a proyectos verificados",
      "Pagos seguros con escrow",
      "Sistema de reputación por IA",
      "Matching inteligente de proyectos",
      "Perfil profesional optimizado",
      "Herramientas de colaboración"
    ],
    company: [
      "Acceso a talento verificado",
      "Gestión de pagos simplificada",
      "Dashboard de proyectos",
      "Filtros avanzados de búsqueda",
      "Soporte dedicado",
      "Facturación automática"
    ]
  };

  const features = {
    freelancer: [
      { icon: CheckCircle, text: "Crea tu perfil profesional" },
      { icon: CheckCircle, text: "Busca proyectos que coincidan con tus habilidades" },
      { icon: CheckCircle, text: "Envía propuestas personalizadas" },
      { icon: CheckCircle, text: "Trabaja con pagos seguros" }
    ],
    company: [
      { icon: CheckCircle, text: "Publica proyectos detallados" },
      { icon: CheckCircle, text: "Recibe propuestas calificadas" },
      { icon: CheckCircle, text: "Gestiona equipos remotos" },
      { icon: CheckCircle, text: "Escala tu negocio globalmente" }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Únete a FreelanceConfía
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Crea tu cuenta gratuita y comienza a formar parte de la comunidad 
              de freelancers más confiable de América Latina
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Side - User Type Selection & Benefits */}
            <div>
              {/* User Type Tabs */}
              <Tabs value={userType} onValueChange={(value) => setUserType(value as "freelancer" | "company")} className="mb-8">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="freelancer" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Freelancer</span>
                  </TabsTrigger>
                  <TabsTrigger value="company" className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4" />
                    <span>Empresa</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="freelancer" className="mt-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      ¿Eres Freelancer?
                    </h2>
                    <p className="text-gray-600">
                      Encuentra proyectos que se adapten a tus habilidades y construye una carrera exitosa
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="company" className="mt-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      ¿Representas una Empresa?
                    </h2>
                    <p className="text-gray-600">
                      Accede al mejor talento de América Latina para hacer crecer tu negocio
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Features */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {userType === "freelancer" ? "Cómo funciona para freelancers" : "Cómo funciona para empresas"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {features[userType].map((feature, index) => {
                      const IconComponent = feature.icon;
                      return (
                        <div key={index} className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5 text-green-500" />
                          <span className="text-gray-700">{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Beneficios incluidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {benefits[userType].map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-gray-700 text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Registration Form */}
            <div>
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-center">
                    Crear cuenta {userType === "freelancer" ? "de Freelancer" : "de Empresa"}
                  </CardTitle>
                  <p className="text-gray-600 text-center">
                    Completa el formulario para comenzar
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Social Registration */}
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Registrarse con Google
                    </Button>
                    
                    <Button variant="outline" className="w-full">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      Registrarse con LinkedIn
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">O regístrate con email</span>
                    </div>
                  </div>

                  {/* Registration Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">
                        {userType === "freelancer" ? "Nombre completo" : "Nombre de la empresa"}
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder={userType === "freelancer" ? "Tu nombre completo" : "Nombre de tu empresa"}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email corporativo</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="tu@email.com"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password">Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          placeholder="Mínimo 8 caracteres"
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          placeholder="Repite tu contraseña"
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Terms and Newsletter */}
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="acceptTerms"
                          name="acceptTerms"
                          checked={formData.acceptTerms}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))
                          }
                          className="mt-1"
                        />
                        <Label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                          Acepto los{" "}
                          <Button variant="link" className="p-0 h-auto text-sm">
                            Términos y Condiciones
                          </Button>
                          {" "}y la{" "}
                          <Button variant="link" className="p-0 h-auto text-sm">
                            Política de Privacidad
                          </Button>
                        </Label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="acceptNewsletter"
                          name="acceptNewsletter"
                          checked={formData.acceptNewsletter}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, acceptNewsletter: checked as boolean }))
                          }
                          className="mt-1"
                        />
                        <Label htmlFor="acceptNewsletter" className="text-sm leading-relaxed">
                          Quiero recibir actualizaciones, tips y ofertas especiales por email
                        </Label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        "Creando cuenta..."
                      ) : (
                        <>
                          Crear cuenta gratuita
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Login Link */}
                  <div className="text-center pt-4 border-t">
                    <p className="text-gray-600">
                      ¿Ya tienes cuenta?{" "}
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <Link to="/login">Iniciar sesión</Link>
                      </Button>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;