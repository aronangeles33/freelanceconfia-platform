import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  DollarSign, 
  FileText, 
  Calendar,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Download,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import escrowPaymentService, { PaymentMilestone, EscrowTransaction, DisputeInfo, EscrowStats } from '@/services/escrowPaymentService';

interface EscrowDashboardProps {
  projectId?: string;
  userType: 'client' | 'freelancer';
}

const EscrowDashboard: React.FC<EscrowDashboardProps> = ({ projectId, userType }) => {
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([]);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [disputes, setDisputes] = useState<DisputeInfo[]>([]);
  const [stats, setStats] = useState<EscrowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<EscrowTransaction | null>(null);
  
  // Dialog states
  const [showCreateMilestone, setShowCreateMilestone] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  
  // Form states
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'USD',
    dueDate: ''
  });

  const [disputeForm, setDisputeForm] = useState({
    reason: '',
    description: '',
    evidence: [] as File[]
  });

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [projectId, userType]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const promises = [];
      
      if (projectId) {
        promises.push(escrowPaymentService.getProjectMilestones(projectId));
      }
      
      promises.push(escrowPaymentService.getUserTransactions(userType));
      promises.push(escrowPaymentService.getUserDisputes());
      promises.push(escrowPaymentService.getEscrowStats());

      const results = await Promise.all(promises);
      
      let resultIndex = 0;
      if (projectId) {
        setMilestones(results[resultIndex++]);
      }
      
      setTransactions(results[resultIndex++]);
      setDisputes(results[resultIndex++]);
      setStats(results[resultIndex++]);
      
    } catch (error) {
      console.error('Error loading escrow data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de pagos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMilestone = async () => {
    if (!projectId) return;
    
    try {
      const milestone = await escrowPaymentService.createPaymentMilestone(projectId, {
        title: newMilestone.title,
        description: newMilestone.description,
        amount: parseFloat(newMilestone.amount),
        currency: newMilestone.currency,
        dueDate: newMilestone.dueDate ? new Date(newMilestone.dueDate) : undefined
      });

      setMilestones([...milestones, milestone]);
      setShowCreateMilestone(false);
      setNewMilestone({ title: '', description: '', amount: '', currency: 'USD', dueDate: '' });
      
      toast({
        title: "Hito creado",
        description: "El hito de pago se ha creado exitosamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el hito de pago",
        variant: "destructive"
      });
    }
  };

  const handleInitiatePayment = async (milestoneId: string) => {
    try {
      const { clientSecret, transaction } = await escrowPaymentService.initiateEscrowPayment(milestoneId, 'card');
      
      // Aquí integraríamos con Stripe Elements para procesar el pago
      // Por ahora simulamos el flujo
      
      setTransactions([...transactions, transaction]);
      toast({
        title: "Pago iniciado",
        description: "El pago se está procesando"
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar el pago",
        variant: "destructive"
      });
    }
  };

  const handleReleaseFunds = async (transactionId: string) => {
    try {
      const updatedTransaction = await escrowPaymentService.approveAndReleaseFunds(transactionId);
      
      setTransactions(transactions.map(t => 
        t.id === transactionId ? updatedTransaction : t
      ));
      
      toast({
        title: "Fondos liberados",
        description: "Los fondos han sido liberados al freelancer"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron liberar los fondos",
        variant: "destructive"
      });
    }
  };

  const handleInitiateDispute = async () => {
    if (!selectedTransaction) return;
    
    try {
      const dispute = await escrowPaymentService.initiateDispute(
        selectedTransaction.id,
        disputeForm.reason,
        disputeForm.description,
        disputeForm.evidence
      );

      setDisputes([...disputes, dispute]);
      setShowDisputeDialog(false);
      setDisputeForm({ reason: '', description: '', evidence: [] });
      
      toast({
        title: "Disputa iniciada",
        description: "Tu disputa ha sido enviada para revisión"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo iniciar la disputa",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'in_escrow':
      case 'held_in_escrow':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'released':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disputed':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'refunded':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'in_escrow':
      case 'held_in_escrow':
        return 'blue';
      case 'released':
        return 'green';
      case 'disputed':
        return 'orange';
      case 'refunded':
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pagos Escrow</h1>
          <p className="text-gray-600">Sistema de pagos seguros con garantía</p>
        </div>
        
        {userType === 'client' && projectId && (
          <Dialog open={showCreateMilestone} onOpenChange={setShowCreateMilestone}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Crear Hito
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Hito de Pago</DialogTitle>
                <DialogDescription>
                  Define un hito de pago para el proyecto
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                    placeholder="Ej: Diseño inicial completado"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newMilestone.description}
                    onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                    placeholder="Describe los entregables de este hito"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Monto</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newMilestone.amount}
                      onChange={(e) => setNewMilestone({...newMilestone, amount: e.target.value})}
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Moneda</Label>
                    <Select
                      value={newMilestone.currency}
                      onValueChange={(value) => setNewMilestone({...newMilestone, currency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="MXN">MXN</SelectItem>
                        <SelectItem value="COP">COP</SelectItem>
                        <SelectItem value="ARS">ARS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="dueDate">Fecha límite (opcional)</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={newMilestone.dueDate}
                    onChange={(e) => setNewMilestone({...newMilestone, dueDate: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateMilestone} className="flex-1">
                    Crear Hito
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateMilestone(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">En Escrow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalEscrowAmount)}</div>
              <p className="text-xs text-gray-600">Fondos retenidos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReleases}</div>
              <p className="text-xs text-gray-600">Liberaciones pendientes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Disputas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDisputes}</div>
              <p className="text-xs text-gray-600">Casos activos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Éxito</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <p className="text-xs text-gray-600">Tasa de éxito</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="milestones" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="milestones">Hitos</TabsTrigger>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="disputes">Disputas</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones" className="space-y-4">
          {projectId && milestones.length > 0 ? (
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <Card key={milestone.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(milestone.status)}
                          {milestone.title}
                        </CardTitle>
                        <CardDescription>{milestone.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {formatCurrency(milestone.amount, milestone.currency)}
                        </div>
                        <Badge variant={getStatusColor(milestone.status) as any}>
                          {milestone.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {milestone.dueDate && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {new Date(milestone.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {milestone.status === 'pending' && userType === 'client' && (
                          <Button
                            size="sm"
                            onClick={() => handleInitiatePayment(milestone.id)}
                            className="flex items-center gap-1"
                          >
                            <CreditCard className="h-4 w-4" />
                            Pagar
                          </Button>
                        )}
                        
                        {milestone.status === 'in_escrow' && userType === 'client' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Find related transaction and release funds
                              const transaction = transactions.find(t => t.milestoneId === milestone.id);
                              if (transaction) {
                                handleReleaseFunds(transaction.id);
                              }
                            }}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Liberar Fondos
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay hitos de pago</h3>
                <p className="text-gray-600 mb-4">
                  {userType === 'client' 
                    ? 'Crea hitos de pago para estructurar el proyecto'
                    : 'El cliente aún no ha creado hitos de pago'
                  }
                </p>
                {userType === 'client' && projectId && (
                  <Button onClick={() => setShowCreateMilestone(true)}>
                    Crear primer hito
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Hito</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.metadata.projectTitle}</TableCell>
                    <TableCell>{transaction.metadata.milestoneTitle}</TableCell>
                    <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.status)}
                        <Badge variant={getStatusColor(transaction.status) as any}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4" />
                        </Button>
                        {transaction.status === 'held_in_escrow' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowDisputeDialog(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay transacciones</h3>
                <p className="text-gray-600">Las transacciones aparecerán aquí cuando se realicen pagos</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="disputes" className="space-y-4">
          {disputes.length > 0 ? (
            <div className="space-y-4">
              {disputes.map((dispute) => (
                <Card key={dispute.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        Disputa #{dispute.id.slice(-6)}
                      </CardTitle>
                      <Badge variant={dispute.status === 'open' ? 'destructive' : 'outline'}>
                        {dispute.status}
                      </Badge>
                    </div>
                    <CardDescription>{dispute.reason}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{dispute.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Iniciada por: {dispute.initiatedBy} • {new Date(dispute.createdAt).toLocaleDateString()}
                      </div>
                      <Button size="sm" variant="outline">
                        Ver detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay disputas</h3>
                <p className="text-gray-600">Las disputas aparecerán aquí si hay problemas con los pagos</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes de Pago</CardTitle>
              <CardDescription>Descarga reportes detallados de tus transacciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Reporte Mensual
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Reporte Anual
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Estado de Cuenta
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Historial de Disputas
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar Disputa</DialogTitle>
            <DialogDescription>
              Inicia una disputa si hay problemas con este pago
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="disputeReason">Motivo</Label>
              <Select
                value={disputeForm.reason}
                onValueChange={(value) => setDisputeForm({...disputeForm, reason: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work_not_delivered">Trabajo no entregado</SelectItem>
                  <SelectItem value="poor_quality">Calidad deficiente</SelectItem>
                  <SelectItem value="not_as_described">No coincide con la descripción</SelectItem>
                  <SelectItem value="late_delivery">Entrega tardía</SelectItem>
                  <SelectItem value="communication_issues">Problemas de comunicación</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="disputeDescription">Descripción</Label>
              <Textarea
                id="disputeDescription"
                value={disputeForm.description}
                onChange={(e) => setDisputeForm({...disputeForm, description: e.target.value})}
                placeholder="Describe detalladamente el problema"
              />
            </div>
            <div>
              <Label htmlFor="evidence">Evidencia (opcional)</Label>
              <Input
                id="evidence"
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setDisputeForm({...disputeForm, evidence: files});
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInitiateDispute} className="flex-1">
                Iniciar Disputa
              </Button>
              <Button variant="outline" onClick={() => setShowDisputeDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EscrowDashboard;