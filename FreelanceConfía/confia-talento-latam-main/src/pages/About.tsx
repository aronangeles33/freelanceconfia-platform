import { Shield, Users, Award, Globe, Heart, Target, TrendingUp, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const About = () => {
  const stats = [
    { label: "Freelancers Activos", value: "10,000+", icon: Users },
    { label: "Empresas Registradas", value: "5,000+", icon: Award },
    { label: "Proyectos Completados", value: "25,000+", icon: Target },
    { label: "Países", value: "18", icon: Globe }
  ];

  const team = [
    {
      name: "María González",
      role: "CEO & Fundadora",
      image: "/api/placeholder/150/150",
      description: "Ex-directora de producto en unicornio tech. Apasionada por empoderar el talento latino."
    },
    {
      name: "Carlos Rivera",
      role: "CTO",
      image: "/api/placeholder/150/150",
      description: "Ingeniero con 15 años de experiencia. Experto en arquitectura de sistemas escalables."
    },
    {
      name: "Ana Martínez",
      role: "Head of Operations",
      image: "/api/placeholder/150/150",
      description: "Especialista en operaciones y procesos. Garantiza la mejor experiencia de usuario."
    },
    {
      name: "Diego Fernández",
      role: "Head of Marketing",
      image: "/api/placeholder/150/150",
      description: "Experto en growth marketing. Impulsa el crecimiento de nuestra comunidad."
    }
  ];

  const values = [
    {
      icon: Shield,
      title: "Confianza",
      description: "Verificación rigurosa y sistema de reputación basado en IA para garantizar calidad."
    },
    {
      icon: Heart,
      title: "Comunidad",
      description: "Creamos vínculos fuertes entre freelancers y empresas de América Latina."
    },
    {
      icon: TrendingUp,
      title: "Crecimiento",
      description: "Impulsamos el desarrollo profesional y económico de nuestros usuarios."
    },
    {
      icon: Star,
      title: "Excelencia",
      description: "Buscamos la excelencia en cada proyecto y relación comercial."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10"></div>
          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Construyendo el futuro del
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {" "}trabajo remoto
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                FreelanceConfía nació para conectar el mejor talento de América Latina con oportunidades 
                globales, creando un ecosistema de confianza y crecimiento mutuo.
              </p>
              <Button size="lg" className="btn-hero">
                Conoce Nuestra Historia
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Nuestra Historia
                </h2>
                <p className="text-xl text-gray-600">
                  Todo comenzó con una idea simple: crear un espacio donde el talento latino brillara sin fronteras
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    El problema que vimos
                  </h3>
                  <p className="text-gray-600 mb-6">
                    En 2023, observamos que miles de freelancers talentosos en América Latina luchaban por encontrar 
                    oportunidades justas y bien remuneradas, mientras que las empresas buscaban talento confiable 
                    sin éxito en plataformas saturadas.
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Nuestra solución
                  </h3>
                  <p className="text-gray-600">
                    Creamos FreelanceConfía con tecnología de vanguardia: verificación por IA, pagos en escrow 
                    seguros y un sistema de matching inteligente que conecta el talento perfecto con cada proyecto.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h4 className="font-bold text-gray-900 mb-4">Desde nuestro lanzamiento:</h4>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                        +$5M generados para freelancers
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                        98% tasa de satisfacción
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                        Presencia en 18 países
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                        Crecimiento de 300% anual
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Nuestros Valores
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Los principios que guían cada decisión y nos mantienen enfocados en nuestro propósito
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {value.title}
                      </h3>
                      <p className="text-gray-600">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Nuestro Equipo
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Conoce a las personas apasionadas que hacen posible FreelanceConfía cada día
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-secondary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Listo para ser parte de nuestra historia?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Únete a miles de freelancers y empresas que ya están construyendo el futuro del trabajo en América Latina
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Registrarse como Freelancer
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Registrarse como Empresa
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;