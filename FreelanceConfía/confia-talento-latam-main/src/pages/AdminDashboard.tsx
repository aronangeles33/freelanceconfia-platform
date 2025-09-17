import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FolderOpen, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp,
  Eye,
  Ban,
  Check,
  X,
  Shield,
  MessageSquare,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalTransactions: number;
  pendingReports: number;
  activeUsers: number;
  completedProjects: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'freelancer' | 'company';
  verified: boolean;
  reputation: number;
  joinDate: string;
  status: 'active' | 'suspended' | 'banned';
  totalProjects: number;
  totalEarnings: number;
}

interface ProjectData {
  _id: string;
  title: string;
  client: string;
  budget: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  applications: number;
  flagged: boolean;
}

interface ReportData {
  _id: string;
  type: 'spam' | 'fraud' | 'inappropriate' | 'fake_profile' | 'payment_issue';
  reportedUser: string;
  reportedBy: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalTransactions: 0,
    pendingReports: 0,
    activeUsers: 0,
    completedProjects: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });

  const [users, setUsers] = useState<UserData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // Simular datos del admin (en producción vendría del backend)
      const mockStats: AdminStats = {
        totalUsers: 15847,
        totalProjects: 8932,
        totalTransactions: 12456,
        pendingReports: 23,
        activeUsers: 1205,
        completedProjects: 7841,
        totalRevenue: 2847563,
        monthlyGrowth: 12.5
      };

      const mockUsers: UserData[] = [
        {
          _id: '1',
          name: 'Juan Pérez',
          email: 'juan@email.com',
          role: 'freelancer',
          verified: true,
          reputation: 4.8,
          joinDate: '2024-01-15',
          status: 'active',
          totalProjects: 15,
          totalEarnings: 45000
        },
        {
          _id: '2',
          name: 'TechCorp Solutions',
          email: 'contact@techcorp.com',
          role: 'company',
          verified: true,
          reputation: 4.9,
          joinDate: '2024-02-01',
          status: 'active',
          totalProjects: 8,
          totalEarnings: 0
        },
        {
          _id: '3',
          name: 'María García',
          email: 'maria@email.com',
          role: 'freelancer',
          verified: false,
          reputation: 3.2,
          joinDate: '2024-03-10',
          status: 'suspended',
          totalProjects: 2,
          totalEarnings: 1200
        }
      ];

      const mockProjects: ProjectData[] = [
        {
          _id: '1',
          title: 'Desarrollo de E-commerce',
          client: 'TechCorp Solutions',
          budget: 5000,
          status: 'in_progress',
          createdAt: '2024-01-20',
          applications: 12,
          flagged: false
        },
        {
          _id: '2',
          title: 'Diseño de Logo Empresarial',
          client: 'Startup Innovations',
          budget: 800,
          status: 'completed',
          createdAt: '2024-01-15',
          applications: 8,
          flagged: false
        },
        {
          _id: '3',
          title: 'Proyecto Sospechoso',
          client: 'Usuario Dudoso',
          budget: 50000,
          status: 'open',
          createdAt: '2024-01-25',
          applications: 1,
          flagged: true
        }
      ];

      const mockReports: ReportData[] = [
        {
          _id: '1',
          type: 'spam',
          reportedUser: 'Usuario Spam',
          reportedBy: 'Juan Pérez',
          description: 'Enviando mensajes no solicitados a múltiples usuarios',
          status: 'pending',
          createdAt: '2024-01-25',
          severity: 'medium'
        },
        {
          _id: '2',
          type: 'fraud',
          reportedUser: 'Estafador123',
          reportedBy: 'María García',
          description: 'Solicitó pago por adelantado sin completar el trabajo',
          status: 'investigating',
          createdAt: '2024-01-24',
          severity: 'high'
        },
        {
          _id: '3',
          type: 'fake_profile',
          reportedUser: 'Perfil Falso',
          reportedBy: 'TechCorp Solutions',
          description: 'Usando fotos e información de otra persona',
          status: 'pending',
          createdAt: '2024-01-23',
          severity: 'critical'
        }
      ];

      setStats(mockStats);
      setUsers(mockUsers);
      setProjects(mockProjects);
      setReports(mockReports);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar los datos del admin",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'ban' | 'activate' | 'verify') => {
    try {
      // Aquí se haría la llamada al API
      setUsers(prev => 
        prev.map(user => 
          user._id === userId 
            ? { 
                ...user, 
                status: action === 'suspend' ? 'suspended' : action === 'ban' ? 'banned' : 'active',
                verified: action === 'verify' ? true : user.verified
              }
            : user
        )
      );

      toast({
        title: "Acción completada",
        description: `Usuario ${action === 'suspend' ? 'suspendido' : action === 'ban' ? 'baneado' : action === 'verify' ? 'verificado' : 'activado'} exitosamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar la acción",
        variant: "destructive"
      });
    }
  };

  const handleReportAction = async (reportId: string, action: 'resolve' | 'dismiss' | 'investigate') => {
    try {
      setReports(prev =>
        prev.map(report =>
          report._id === reportId
            ? { ...report, status: action === 'resolve' ? 'resolved' : action === 'dismiss' ? 'dismissed' : 'investigating' }
            : report
        )
      );

      toast({
        title: "Reporte actualizado",
        description: `Reporte ${action === 'resolve' ? 'resuelto' : action === 'dismiss' ? 'descartado' : 'en investigación'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el reporte",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      banned: 'bg-red-100 text-red-800',
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      investigating: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={colors[severity as keyof typeof colors]}>
        {severity}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Cargando dashboard administrativo...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-600">
              Gestiona usuarios, proyectos y reportes de la plataforma
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsers} activos hoy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proyectos</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completedProjects} completados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.monthlyGrowth}% este mes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reportes Pendientes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingReports}</div>
                <p className="text-xs text-muted-foreground">
                  Requieren atención
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">Usuarios</TabsTrigger>
              <TabsTrigger value="projects">Proyectos</TabsTrigger>
              <TabsTrigger value="reports">Reportes</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>
                    Administra usuarios, verifica cuentas y toma acciones disciplinarias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <Input
                      placeholder="Buscar usuarios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="suspended">Suspendidos</SelectItem>
                        <SelectItem value="banned">Baneados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Reputación</TableHead>
                        <TableHead>Proyectos</TableHead>
                        <TableHead>Ganancias</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'freelancer' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {getStatusBadge(user.status)}
                              {user.verified && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verificado
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1 text-yellow-500" />
                              {user.reputation.toFixed(1)}
                            </div>
                          </TableCell>
                          <TableCell>{user.totalProjects}</TableCell>
                          <TableCell>{formatCurrency(user.totalEarnings)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              {!user.verified && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUserAction(user._id, 'verify')}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              {user.status === 'active' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUserAction(user._id, 'suspend')}
                                >
                                  <Ban className="h-3 w-3" />
                                </Button>
                              )}
                              {user.status === 'suspended' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUserAction(user._id, 'activate')}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Proyectos</CardTitle>
                  <CardDescription>
                    Supervisa proyectos, identifica contenido inapropiado y modera disputas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Proyecto</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Presupuesto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Aplicaciones</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project) => (
                        <TableRow key={project._id} className={project.flagged ? 'bg-red-50' : ''}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{project.title}</p>
                              {project.flagged && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{project.client}</TableCell>
                          <TableCell>{formatCurrency(project.budget)}</TableCell>
                          <TableCell>{getStatusBadge(project.status)}</TableCell>
                          <TableCell>{project.applications}</TableCell>
                          <TableCell>{formatDate(project.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              {project.flagged && (
                                <Button size="sm" variant="destructive">
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Reportes</CardTitle>
                  <CardDescription>
                    Revisa y resuelve reportes de usuarios sobre contenido inapropiado o comportamiento sospechoso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Usuario Reportado</TableHead>
                        <TableHead>Reportado por</TableHead>
                        <TableHead>Severidad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report._id}>
                          <TableCell>
                            <Badge variant="outline">{report.type}</Badge>
                          </TableCell>
                          <TableCell>{report.reportedUser}</TableCell>
                          <TableCell>{report.reportedBy}</TableCell>
                          <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                          <TableCell>{formatDate(report.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              {report.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleReportAction(report._id, 'investigate')}
                                  >
                                    <MessageSquare className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleReportAction(report._id, 'resolve')}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleReportAction(report._id, 'dismiss')}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas de Plataforma</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Tasa de Conversión</span>
                        <span className="font-bold">24.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tiempo Promedio de Proyecto</span>
                        <span className="font-bold">18 días</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Satisfacción del Cliente</span>
                        <span className="font-bold">4.7/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retención de Usuarios</span>
                        <span className="font-bold">78%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Alertas del Sistema</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          23 reportes pendientes de revisión
                        </AlertDescription>
                      </Alert>
                      <Alert>
                        <CreditCard className="h-4 w-4" />
                        <AlertDescription>
                          5 transacciones requieren verificación manual
                        </AlertDescription>
                      </Alert>
                      <Alert>
                        <Users className="h-4 w-4" />
                        <AlertDescription>
                          12 usuarios nuevos esperando verificación
                        </AlertDescription>
                      </Alert>
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

export default AdminDashboard;