import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Users, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    userType: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulación de envío (en producción se conectaría al backend)
    setTimeout(() => {
      toast({
        title: "Mensaje enviado",
        description: "Gracias por contactarnos. Te responderemos en menos de 24 horas.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        userType: ""
      });
      setIsLoading(false);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "hola@freelanceconfia.com",
      description: "Respuesta en menos de 24 horas"
    },
    {
      icon: Phone,
      title: "Teléfono",
      content: "+52 55 1234 5678",
      description: "Lunes a Viernes, 9 AM - 6 PM (GMT-6)"
    },
    {
      icon: MapPin,
      title: "Oficina Principal",
      content: "Ciudad de México, México",
      description: "También tenemos presencia en 18 países"
    },
    {
      icon: Clock,
      title: "Horario de Atención",
      content: "24/7 Soporte Online",
      description: "Chat en vivo disponible siempre"
    }
  ];

  const supportOptions = [
    {
      icon: MessageSquare,
      title: "Chat en Vivo",
      description: "Habla directamente con nuestro equipo de soporte",
      action: "Iniciar Chat",
      color: "bg-blue-500"
    },
    {
      icon: Users,
      title: "Centro de Ayuda",
      description: "Encuentra respuestas a las preguntas más frecuentes",
      action: "Ver Artículos",
      color: "bg-green-500"
    },
    {
      icon: Headphones,
      title: "Soporte Técnico",
      description: "Asistencia especializada para problemas técnicos",
      action: "Contactar Técnico",
      color: "bg-purple-500"
    }
  ];

  const officeLocations = [
    {
      city: "Ciudad de México",
      country: "México",
      address: "Av. Reforma 123, Col. Centro",
      isMain: true
    },
    {
      city: "Bogotá",
      country: "Colombia", 
      address: "Zona Rosa, Calle 85",
      isMain: false
    },
    {
      city: "Buenos Aires",
      country: "Argentina",
      address: "Puerto Madero, Av. Alicia Moreau",
      isMain: false
    },
    {
      city: "Santiago",
      country: "Chile",
      address: "Las Condes, Av. Providencia",
      isMain: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                ¿Necesitas ayuda?
                <span className="block text-primary">Estamos aquí para ti</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Nuestro equipo está disponible 24/7 para resolver tus dudas y ayudarte a tener 
                la mejor experiencia en FreelanceConfía
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Envíanos un mensaje</CardTitle>
                  <p className="text-gray-600">
                    Completa el formulario y te responderemos lo antes posible
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="userType">Soy...</Label>
                      <select
                        id="userType"
                        name="userType"
                        value={formData.userType}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Seleccionar</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="empresa">Empresa</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="subject">Asunto</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="¿En qué podemos ayudarte?"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Mensaje</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder="Describe tu consulta o problema..."
                        rows={5}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        "Enviando..."
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar Mensaje
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Información de Contacto
                  </h2>
                  <div className="space-y-6">
                    {contactInfo.map((info, index) => {
                      const IconComponent = info.icon;
                      return (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{info.title}</h3>
                            <p className="text-gray-900">{info.content}</p>
                            <p className="text-sm text-gray-600">{info.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Support Options */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Otras formas de obtener ayuda
                  </h3>
                  <div className="space-y-4">
                    {supportOptions.map((option, index) => {
                      const IconComponent = option.icon;
                      return (
                        <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                              <div className={`p-2 rounded-lg ${option.color}`}>
                                <IconComponent className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{option.title}</h4>
                                <p className="text-sm text-gray-600">{option.description}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                {option.action}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Office Locations */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Nuestras Oficinas
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Con presencia en toda América Latina, estamos cerca de ti
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {officeLocations.map((office, index) => (
                <Card key={index} className={`text-center ${office.isMain ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-6">
                    {office.isMain && (
                      <div className="bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full mb-3 inline-block">
                        Oficina Principal
                      </div>
                    )}
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{office.city}</h3>
                    <p className="text-primary font-medium mb-2">{office.country}</p>
                    <p className="text-sm text-gray-600">{office.address}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Quick Links */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Preguntas Frecuentes
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Antes de contactarnos, revisa si tu pregunta ya tiene respuesta
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">Para Freelancers</h3>
                  <p className="text-sm text-gray-600 mb-4">Cómo registrarse, encontrar proyectos y cobrar</p>
                  <Button variant="outline" size="sm">Ver FAQ</Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">Para Empresas</h3>
                  <p className="text-sm text-gray-600 mb-4">Cómo publicar proyectos y contratar talento</p>
                  <Button variant="outline" size="sm">Ver FAQ</Button>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">Pagos y Seguridad</h3>
                  <p className="text-sm text-gray-600 mb-4">Sistema escrow, tarifas y protección</p>
                  <Button variant="outline" size="sm">Ver FAQ</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;