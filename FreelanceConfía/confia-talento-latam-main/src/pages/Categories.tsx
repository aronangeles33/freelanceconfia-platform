import { Code, Palette, Megaphone, Globe, PenTool, Users, Calculator, Camera, Headphones, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Categories = () => {
  const categories = [
    {
      id: 1,
      name: "Desarrollo Web",
      icon: Code,
      description: "Desarrollo de sitios web, aplicaciones y sistemas",
      projectCount: 245,
      avgBudget: 3200,
      skills: ["React", "Vue", "Angular", "Node.js", "Python", "PHP"],
      color: "bg-blue-500"
    },
    {
      id: 2,
      name: "Diseño Gráfico",
      icon: Palette,
      description: "Diseño de logos, branding, interfaces y material gráfico",
      projectCount: 189,
      avgBudget: 1500,
      skills: ["Photoshop", "Illustrator", "Figma", "Canva", "InDesign"],
      color: "bg-purple-500"
    },
    {
      id: 3,
      name: "Marketing Digital",
      icon: Megaphone,
      description: "SEO, SEM, redes sociales y estrategias de marketing",
      projectCount: 156,
      avgBudget: 2800,
      skills: ["Google Ads", "Facebook Ads", "SEO", "Analytics", "Email Marketing"],
      color: "bg-green-500"
    },
    {
      id: 4,
      name: "Traducción",
      icon: Globe,
      description: "Traducción de documentos y contenido multimedia",
      projectCount: 98,
      avgBudget: 800,
      skills: ["Inglés", "Portugués", "Francés", "Traducción Técnica"],
      color: "bg-orange-500"
    },
    {
      id: 5,
      name: "Redacción",
      icon: PenTool,
      description: "Creación de contenido, copywriting y redacción técnica",
      projectCount: 134,
      avgBudget: 1200,
      skills: ["Copywriting", "Content Marketing", "Blog Writing", "SEO Writing"],
      color: "bg-red-500"
    },
    {
      id: 6,
      name: "Consultoría",
      icon: Users,
      description: "Asesoría empresarial, estrategia y consultoría especializada",
      projectCount: 87,
      avgBudget: 4500,
      skills: ["Estrategia", "Business Intelligence", "Análisis", "Consultoría"],
      color: "bg-indigo-500"
    },
    {
      id: 7,
      name: "Contabilidad",
      icon: Calculator,
      description: "Servicios contables, financieros y de auditoría",
      projectCount: 76,
      avgBudget: 2200,
      skills: ["Contabilidad", "Finanzas", "Auditoría", "Impuestos"],
      color: "bg-yellow-500"
    },
    {
      id: 8,
      name: "Fotografía",
      icon: Camera,
      description: "Servicios fotográficos y edición de imágenes",
      projectCount: 65,
      avgBudget: 1800,
      skills: ["Fotografía", "Lightroom", "Photoshop", "Edición"],
      color: "bg-pink-500"
    },
    {
      id: 9,
      name: "Audio y Video",
      icon: Headphones,
      description: "Edición de audio, video y producción multimedia",
      projectCount: 54,
      avgBudget: 2600,
      skills: ["Premiere", "After Effects", "Audacity", "Final Cut"],
      color: "bg-cyan-500"
    },
    {
      id: 10,
      name: "Otros Servicios",
      icon: Briefcase,
      description: "Servicios diversos y especializados",
      projectCount: 43,
      avgBudget: 1600,
      skills: ["Diversos", "Especializado", "Personalizado"],
      color: "bg-gray-500"
    }
  ];

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleCategoryClick = (categoryName: string) => {
    // En una aplicación real, esto navegaría a la página de proyectos con filtro
    console.log(`Navegando a proyectos de ${categoryName}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Categorías de Proyectos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explora las diferentes áreas de trabajo y encuentra proyectos que se adapten a tus habilidades
          </p>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">1,247</div>
            <div className="text-gray-600">Proyectos Activos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">10+</div>
            <div className="text-gray-600">Categorías</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">$2,400</div>
            <div className="text-gray-600">Presupuesto Promedio</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">98%</div>
            <div className="text-gray-600">Satisfacción</div>
          </div>
        </div>

        {/* Grid de categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.id} 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleCategoryClick(category.name)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${category.color} group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.projectCount} proyectos
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {category.name}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {category.description}
                  </p>

                  <div className="space-y-3">
                    {/* Presupuesto promedio */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Presupuesto promedio:</span>
                      <span className="font-semibold text-green-600">
                        {formatBudget(category.avgBudget)}
                      </span>
                    </div>

                    {/* Skills más demandadas */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Skills más demandadas:</p>
                      <div className="flex flex-wrap gap-1">
                        {category.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {category.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <Button 
                      className="w-full mt-4 group-hover:bg-primary group-hover:text-white transition-colors"
                      variant="outline"
                    >
                      Ver Proyectos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿No encuentras tu categoría?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            FreelanceConfía está en constante crecimiento. Si tu área de especialización no está listada, 
            contáctanos y trabajaremos juntos para incluirla.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              Sugerir Categoría
            </Button>
            <Button variant="outline" size="lg">
              Ver Todos los Proyectos
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Categories;