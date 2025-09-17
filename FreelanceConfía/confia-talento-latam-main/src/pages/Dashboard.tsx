import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Briefcase, 
  DollarSign, 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Calendar,
  Plus,
  Search,
  Filter,
  BarChart3,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { projectService } from "@/services/projectService";
import { userService } from "@/services/userService";
import { type Project } from "@/lib/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        // Cargar proyectos según el tipo de usuario
        const response = await projectService.getProjects({
          limit: 6
        });
        setProjects(response.projects);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const isFreelancer = user.userType === 'freelancer';

  // Datos de ejemplo para el dashboard
  const stats = isFreelancer ? {
    totalProjects: 12,
    activeProjects: 3,
    completedProjects: 9,
    totalEarnings: 2500,
    rating: 4.8,
    responseRate: 95
  } : {
    totalProjects: 8,
    activeProjects: 2,
    completedProjects: 6,
    totalSpent: 15000,
    avgRating: 4.6,
    successRate: 100
  };

  const recentActivity = [
    {
      id: 1,
      type: 'proposal',
      title: 'Nueva propuesta enviada',
      description: 'Desarrollo de aplicación móvil',
      time: '2 horas',
      status: 'pending'
    },
    {
      id: 2,
      type: 'message',
      title: 'Nuevo mensaje',
      description: 'Respuesta del cliente sobre el proyecto web',
      time: '4 horas',
      status: 'unread'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Pago recibido',
      description: '$850 por proyecto completado',
      time: '1 día',
      status: 'completed'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Hola, {user.name}! 👋
            </h1>
            <p className="text-gray-600">
              {isFreelancer 
                ? "Aquí tienes un resumen de tus proyectos y actividad reciente."
                : "Gestiona tus proyectos y encuentra el mejor talento para tu empresa."
              }
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isFreelancer ? "Proyectos Totales" : "Proyectos Publicados"}
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  +2 desde el mes pasado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeProjects}</div>
                <p className="text-xs text-muted-foreground">
                  En progreso ahora
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isFreelancer ? "Ingresos Totales" : "Inversión Total"}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${isFreelancer ? stats.totalEarnings : stats.totalSpent}
                </div>
                <p className="text-xs text-muted-foreground">
                  +15% desde el mes pasado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isFreelancer ? "Rating" : "Rating Promedio"}
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isFreelancer ? stats.rating : stats.avgRating}/5
                </div>
                <p className="text-xs text-muted-foreground">
                  Excelente reputación
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="projects">
                {isFreelancer ? "Mis Proyectos" : "Proyectos Publicados"}
              </TabsTrigger>
              <TabsTrigger value="activity">Actividad</TabsTrigger>
              <TabsTrigger value="analytics">Analíticas</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Recent Projects */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>
                        {isFreelancer ? "Proyectos Recientes" : "Mis Proyectos"}
                      </CardTitle>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver todos
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                          ))}
                        </div>
                      ) : (
                        projects.slice(0, 3).map((project) => (
                          <div key={project._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{project.title}</h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {project.category} • ${project.budget}
                              </p>
                            </div>
                            <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                              {project.status === 'open' ? 'Abierto' : 'En progreso'}
                            </Badge>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Activity Feed */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            activity.status === 'pending' ? 'bg-yellow-400' :
                            activity.status === 'unread' ? 'bg-blue-400' : 'bg-green-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-gray-500">{activity.description}</p>
                            <p className="text-xs text-gray-400 mt-1">Hace {activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="h-auto p-6 flex flex-col items-center space-y-2">
                      <Plus className="h-8 w-8" />
                      <span>{isFreelancer ? "Buscar Proyectos" : "Publicar Proyecto"}</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-6 flex flex-col items-center space-y-2">
                      <MessageSquare className="h-8 w-8" />
                      <span>Mensajes</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-6 flex flex-col items-center space-y-2">
                      <BarChart3 className="h-8 w-8" />
                      <span>Reportes</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Buscar proyectos..." className="pl-10 w-64" />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </div>
                <Button onClick={() => navigate(isFreelancer ? '/projects' : '/create-project')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isFreelancer ? "Buscar Proyectos" : "Nuevo Proyecto"}
                </Button>
              </div>

              <div className="grid gap-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  projects.map((project) => (
                    <Card key={project._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {project.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {project.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{project.skills.length - 3} más
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                            {project.status === 'open' ? 'Abierto' : 'En progreso'}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>${project.budget}</span>
                            <span>•</span>
                            <span>{project.category}</span>
                            {project.proposals && (
                              <>
                                <span>•</span>
                                <span>{project.proposals} propuestas</span>
                              </>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            Ver detalles
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Actividad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 pb-6 border-b last:border-b-0">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          activity.status === 'pending' ? 'bg-yellow-400' :
                          activity.status === 'unread' ? 'bg-blue-400' : 'bg-green-400'
                        }`} />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{activity.title}</h4>
                              <p className="text-gray-600 mt-1">{activity.description}</p>
                            </div>
                            <span className="text-sm text-gray-400">Hace {activity.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Rendimiento del Mes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Proyectos Completados</span>
                          <span>80%</span>
                        </div>
                        <Progress value={80} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Satisfacción del Cliente</span>
                          <span>95%</span>
                        </div>
                        <Progress value={95} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Tiempo de Respuesta</span>
                          <span>90%</span>
                        </div>
                        <Progress value={90} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ingresos por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Desarrollo Web</span>
                        <span className="text-sm font-medium">$1,200</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Diseño UI/UX</span>
                        <span className="text-sm font-medium">$800</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Marketing Digital</span>
                        <span className="text-sm font-medium">$500</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Crecimiento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">+25%</div>
                      <p className="text-sm text-gray-600">
                        Aumento en ingresos vs mes anterior
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;