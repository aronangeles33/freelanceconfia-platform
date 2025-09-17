import { useState } from "react";
import { Search, Filter, MapPin, Clock, DollarSign, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock data - en producción esto vendría del backend
  const projects = [
    {
      id: 1,
      title: "Desarrollo de E-commerce con React",
      description: "Necesitamos desarrollar una tienda online moderna con carrito de compras, pasarela de pagos y panel administrativo.",
      budget: 3500,
      category: "Desarrollo Web",
      location: "México",
      client: {
        name: "TechStore MX",
        rating: 4.8,
        reviews: 23
      },
      postedTime: "hace 2 horas",
      proposals: 12,
      skills: ["React", "Node.js", "MongoDB", "Stripe"]
    },
    {
      id: 2,
      title: "Diseño UI/UX para App Móvil",
      description: "Buscamos diseñador para crear la interfaz de una aplicación de delivery de comida. Incluye wireframes, prototipos y guía de estilos.",
      budget: 2000,
      category: "Diseño",
      location: "Colombia",
      client: {
        name: "FoodApp CO",
        rating: 4.9,
        reviews: 15
      },
      postedTime: "hace 5 horas",
      proposals: 8,
      skills: ["Figma", "UI/UX", "Prototyping", "Mobile Design"]
    },
    {
      id: 3,
      title: "Estrategia de Marketing Digital",
      description: "Empresa fintech busca especialista en marketing para lanzamiento de producto. Incluye SEO, SEM, redes sociales y content marketing.",
      budget: 4000,
      category: "Marketing",
      location: "Argentina",
      client: {
        name: "FinTech Solutions",
        rating: 4.7,
        reviews: 31
      },
      postedTime: "hace 1 día",
      proposals: 18,
      skills: ["SEO", "Google Ads", "Social Media", "Content Marketing"]
    },
    {
      id: 4,
      title: "Traducción Técnica ES-EN",
      description: "Traducción de documentación técnica para software de 50 páginas. Experiencia en tecnología requerida.",
      budget: 800,
      category: "Traducción",
      location: "Perú",
      client: {
        name: "SoftwarePE",
        rating: 4.6,
        reviews: 8
      },
      postedTime: "hace 3 días",
      proposals: 5,
      skills: ["Traducción", "Inglés", "Documentación Técnica"]
    },
    {
      id: 5,
      title: "Desarrollo de API REST",
      description: "Desarrollo de API para sistema de gestión empresarial. Incluye autenticación, CRUD operations y documentación.",
      budget: 2800,
      category: "Desarrollo Web",
      location: "Chile",
      client: {
        name: "Empresa Gestión CL",
        rating: 4.5,
        reviews: 12
      },
      postedTime: "hace 1 semana",
      proposals: 22,
      skills: ["Node.js", "Express", "MongoDB", "API Development"]
    }
  ];

  const categories = [
    "all",
    "Desarrollo Web",
    "Diseño",
    "Marketing",
    "Traducción",
    "Redacción",
    "Consultoría"
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Proyectos Disponibles
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra oportunidades perfectas para tus habilidades en América Latina
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categorías */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category === "all" ? "Todas" : category}
                </Button>
              ))}
            </div>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Más filtros
            </Button>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {filteredProjects.length} proyectos
          </p>
        </div>

        {/* Lista de proyectos */}
        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link to={`/project/${project.id}`}>
                      <CardTitle className="text-xl mb-2 hover:text-primary cursor-pointer transition-colors">
                        {project.title}
                      </CardTitle>
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {project.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {project.postedTime}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatBudget(project.budget)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{project.category}</Badge>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-700 mb-4">{project.description}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Cliente y acciones */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-sm">{project.client.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600">
                          {project.client.rating} ({project.client.reviews} reseñas)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {project.proposals} propuestas
                    </span>
                    <Link to={`/project/${project.id}`}>
                      <Button>
                        Ver Detalles
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Paginación */}
        <div className="flex justify-center mt-12">
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              Anterior
            </Button>
            <Button variant="default">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">
              Siguiente
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Projects;