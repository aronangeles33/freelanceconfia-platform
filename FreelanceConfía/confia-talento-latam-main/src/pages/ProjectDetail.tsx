import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Star, 
  Users, 
  Clock, 
  Tag,
  Send,
  Bookmark,
  Share2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { projectService } from "@/services/projectService";
import { type Project } from "@/lib/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    proposal: "",
    coverLetter: "",
    estimatedDelivery: "",
    proposedRate: ""
  });

  // Cargar proyecto
  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const projectData = await projectService.getProject(id);
        setProject(projectData);
      } catch (error) {
        console.error('Error loading project:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar el proyecto",
          variant: "destructive"
        });
        navigate('/projects');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id, navigate, toast]);

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'freelancer') {
      toast({
        title: "Error",
        description: "Solo los freelancers pueden aplicar a proyectos",
        variant: "destructive"
      });
      return;
    }

    setIsApplying(true);

    try {
      // Aquí iría la llamada al servicio de aplicaciones
      // await applicationService.createApplication({
      //   projectId: id,
      //   proposal: applicationData.proposal,
      //   coverLetter: applicationData.coverLetter,
      //   estimatedDelivery: applicationData.estimatedDelivery,
      //   proposedRate: parseFloat(applicationData.proposedRate)
      // });

      toast({
        title: "¡Propuesta enviada!",
        description: "Tu propuesta ha sido enviada exitosamente al cliente"
      });

      setShowApplicationForm(false);
      setApplicationData({
        proposal: "",
        coverLetter: "",
        estimatedDelivery: "",
        proposedRate: ""
      });

    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error al enviar propuesta",
        description: error.response?.data?.error || "Ha ocurrido un error inesperado",
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'No especificada';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Proyecto no encontrado</h1>
            <Button onClick={() => navigate('/projects')}>
              Volver a Proyectos
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isFreelancer = user?.role === 'freelancer';
  const isProjectOwner = user?._id === (typeof project.client === 'string' ? project.client : project.client._id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/projects')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Proyectos
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Contenido Principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header del Proyecto */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary">{project.category}</Badge>
                      {project.urgency && (
                        <Badge className={getUrgencyColor(project.urgency)}>
                          {getUrgencyText(project.urgency)}
                        </Badge>
                      )}
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                      {project.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-4 text-gray-600">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="font-semibold text-green-600">
                          ${project.budget} USD
                        </span>
                        {project.budgetType && (
                          <span className="ml-1">
                            ({project.budgetType === 'fixed' ? 'Precio fijo' : 'Por hora'})
                          </span>
                        )}
                      </div>
                      
                      {project.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {project.location}
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Publicado {formatDate(project.createdAt)}
                      </div>
                      
                      {project.proposals && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {project.proposals} propuestas
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Descripción */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción del Proyecto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Habilidades Requeridas */}
            {project.skills && project.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Habilidades Requeridas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Información Adicional */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Proyecto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {project.deadline && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Fecha Límite</Label>
                      <p className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(project.deadline)}
                      </p>
                    </div>
                  )}
                  
                  {project.estimatedDuration && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Duración Estimada</Label>
                      <p className="mt-1">{project.estimatedDuration}</p>
                    </div>
                  )}
                  
                  {project.experienceLevel && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Nivel de Experiencia</Label>
                      <p className="mt-1 capitalize">{project.experienceLevel}</p>
                    </div>
                  )}
                  
                  {project.projectType && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Tipo de Proyecto</Label>
                      <p className="mt-1">
                        {project.projectType === 'one-time' ? 'Una vez' : 'Proyecto continuo'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Formulario de Aplicación */}
            {showApplicationForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Enviar Propuesta</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleApplicationSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="proposal">Propuesta *</Label>
                      <Textarea
                        id="proposal"
                        value={applicationData.proposal}
                        onChange={(e) => setApplicationData(prev => ({
                          ...prev,
                          proposal: e.target.value
                        }))}
                        placeholder="Describe cómo vas a realizar el proyecto..."
                        rows={5}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="coverLetter">Carta de Presentación</Label>
                      <Textarea
                        id="coverLetter"
                        value={applicationData.coverLetter}
                        onChange={(e) => setApplicationData(prev => ({
                          ...prev,
                          coverLetter: e.target.value
                        }))}
                        placeholder="Cuéntale al cliente por qué eres el mejor candidato..."
                        rows={3}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="proposedRate">Tu Tarifa (USD)</Label>
                        <Input
                          id="proposedRate"
                          type="number"
                          value={applicationData.proposedRate}
                          onChange={(e) => setApplicationData(prev => ({
                            ...prev,
                            proposedRate: e.target.value
                          }))}
                          placeholder="Tu tarifa para este proyecto"
                        />
                      </div>

                      <div>
                        <Label htmlFor="estimatedDelivery">Tiempo de Entrega</Label>
                        <Input
                          id="estimatedDelivery"
                          value={applicationData.estimatedDelivery}
                          onChange={(e) => setApplicationData(prev => ({
                            ...prev,
                            estimatedDelivery: e.target.value
                          }))}
                          placeholder="Ej: 2 semanas"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" disabled={isApplying}>
                        {isApplying ? "Enviando..." : "Enviar Propuesta"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setShowApplicationForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Acciones */}
            <Card>
              <CardContent className="pt-6">
                {!isAuthenticated ? (
                  <div className="space-y-3">
                    <Button className="w-full" onClick={() => navigate('/login')}>
                      Iniciar Sesión para Aplicar
                    </Button>
                    <p className="text-sm text-gray-600 text-center">
                      ¿No tienes cuenta? <button 
                        onClick={() => navigate('/register')}
                        className="text-blue-600 hover:underline"
                      >
                        Regístrate
                      </button>
                    </p>
                  </div>
                ) : isProjectOwner ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-blue-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Este es tu proyecto</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      Ver Propuestas
                    </Button>
                  </div>
                ) : isFreelancer ? (
                  <div className="space-y-3">
                    {!showApplicationForm ? (
                      <Button 
                        className="w-full"
                        onClick={() => setShowApplicationForm(true)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Propuesta
                      </Button>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          Completa el formulario abajo para enviar tu propuesta
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Solo freelancers pueden aplicar a proyectos
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información del Cliente */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre el Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {typeof project.client === 'string' ? 'Cliente' : project.client.name}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">4.8 (23 reseñas)</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Proyectos publicados:</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tasa de contratación:</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Miembro desde:</span>
                    <span className="font-medium">Enero 2024</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proyectos Similares */}
            <Card>
              <CardHeader>
                <CardTitle>Proyectos Similares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <h4 className="font-medium text-sm mb-1">
                        Proyecto similar #{i}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        Categoría similar • $500-800
                      </p>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">5 propuestas</span>
                        <span className="text-gray-500">hace 2 días</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetail;