import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, MapPin, Calendar, Tag, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { projectService } from "@/services/projectService";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const CreateProject = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    budgetType: "fixed", // fixed, hourly
    category: "",
    location: "",
    skills: [] as string[],
    deadline: "",
    urgency: "medium", // low, medium, high
    experienceLevel: "intermediate", // entry, intermediate, expert
    projectType: "one-time", // one-time, ongoing
    estimatedDuration: "",
    attachments: [] as File[]
  });

  // Categorías disponibles
  const categories = [
    "Desarrollo Web",
    "Desarrollo Móvil",
    "Diseño Gráfico",
    "Diseño UI/UX",
    "Marketing Digital",
    "Redacción y Traducción",
    "Consultoría",
    "Administración",
    "Fotografía y Video",
    "Música y Audio",
    "Otros"
  ];

  // Skills comunes por categoría
  const skillsByCategory: { [key: string]: string[] } = {
    "Desarrollo Web": ["React", "Node.js", "JavaScript", "TypeScript", "Python", "PHP", "MongoDB", "MySQL"],
    "Desarrollo Móvil": ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android"],
    "Diseño Gráfico": ["Photoshop", "Illustrator", "InDesign", "Canva", "Figma"],
    "Diseño UI/UX": ["Figma", "Sketch", "Adobe XD", "Prototyping", "User Research"],
    "Marketing Digital": ["SEO", "Google Ads", "Facebook Ads", "Content Marketing", "Analytics"],
    "Redacción y Traducción": ["Copywriting", "Content Writing", "Spanish", "English", "French"]
  };

  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  // Verificar autenticación y tipo de usuario
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (user?.role !== 'company') {
    navigate('/dashboard');
    return null;
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Actualizar skills disponibles cuando cambia la categoría
    if (field === 'category') {
      setAvailableSkills(skillsByCategory[value] || []);
      setFormData(prev => ({
        ...prev,
        skills: [] // Limpiar skills al cambiar categoría
      }));
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validaciones
      if (!formData.title || !formData.description || !formData.budget || !formData.category) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos obligatorios",
          variant: "destructive"
        });
        return;
      }

      if (parseFloat(formData.budget) <= 0) {
        toast({
          title: "Error", 
          description: "El presupuesto debe ser mayor a 0",
          variant: "destructive"
        });
        return;
      }

      // Preparar datos del proyecto
      const projectData = {
        title: formData.title,
        description: formData.description,
        budget: parseFloat(formData.budget),
        budgetType: formData.budgetType as 'fixed' | 'hourly',
        category: formData.category,
        location: formData.location,
        skills: formData.skills,
        deadline: formData.deadline,
        urgency: formData.urgency,
        experienceLevel: formData.experienceLevel as 'entry' | 'intermediate' | 'expert',
        projectType: formData.projectType as 'simple' | 'complex',
        duration: formData.estimatedDuration
      };

      // Crear proyecto
      const newProject = await projectService.createProject(projectData);

      toast({
        title: "¡Proyecto creado exitosamente!",
        description: "Tu proyecto ya está disponible para recibir propuestas"
      });

      // Redirigir al proyecto creado
      navigate(`/projects/${newProject._id}`);

    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Error al crear proyecto",
        description: error.response?.data?.error || "Ha ocurrido un error inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Nuevo Proyecto
          </h1>
          <p className="text-gray-600">
            Publica tu proyecto y recibe propuestas de freelancers calificados
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Formulario Principal */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Información Básica */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Información Básica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título del Proyecto *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Ej: Desarrollo de tienda online con React"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción Detallada *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe tu proyecto, objetivos, requisitos específicos..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Categoría *</Label>
                      <Select onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="location">Ubicación</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="Ciudad, País"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Presupuesto y Tiempo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Presupuesto y Cronograma
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget">Presupuesto (USD) *</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        placeholder="1000"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="budgetType">Tipo de Presupuesto</Label>
                      <Select onValueChange={(value) => handleInputChange('budgetType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Precio fijo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Precio Fijo</SelectItem>
                          <SelectItem value="hourly">Por Hora</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deadline">Fecha Límite</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => handleInputChange('deadline', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="estimatedDuration">Duración Estimada</Label>
                      <Input
                        id="estimatedDuration"
                        value={formData.estimatedDuration}
                        onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                        placeholder="Ej: 2-3 semanas"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="urgency">Urgencia</Label>
                      <Select onValueChange={(value) => handleInputChange('urgency', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Media" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="projectType">Tipo de Proyecto</Label>
                      <Select onValueChange={(value) => handleInputChange('projectType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Una vez" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one-time">Una Vez</SelectItem>
                          <SelectItem value="ongoing">Proyecto Continuo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills Requeridas */}
              {formData.category && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Tag className="h-5 w-5 mr-2" />
                      Habilidades Requeridas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableSkills.map((skill) => (
                        <div key={skill} className="flex items-center space-x-2">
                          <Checkbox
                            id={skill}
                            checked={formData.skills.includes(skill)}
                            onCheckedChange={() => handleSkillToggle(skill)}
                          />
                          <Label htmlFor={skill} className="text-sm">{skill}</Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Nivel de Experiencia */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Experiencia Requerida
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select onValueChange={(value) => handleInputChange('experienceLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Intermedio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="expert">Experto</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Preview del Proyecto */}
              <Card>
                <CardHeader>
                  <CardTitle>Vista Previa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Título</p>
                    <p className="font-medium">{formData.title || "Título del proyecto"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Presupuesto</p>
                    <p className="font-medium text-green-600">
                      ${formData.budget || "0"} USD
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Categoría</p>
                    <p className="font-medium">{formData.category || "Sin categoría"}</p>
                  </div>

                  {formData.skills.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {formData.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{formData.skills.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Consejos */}
              <Card>
                <CardHeader>
                  <CardTitle>💡 Consejos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p>• Sé específico en la descripción para recibir mejores propuestas</p>
                  <p>• Define un presupuesto realista para atraer freelancers calificados</p>
                  <p>• Selecciona las habilidades exactas que necesitas</p>
                  <p>• Una fecha límite clara ayuda a los freelancers a planificar</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
              Cancelar
            </Button>
            
            <Button type="submit" disabled={isLoading} className="min-w-32">
              {isLoading ? "Creando..." : "Publicar Proyecto"}
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default CreateProject;