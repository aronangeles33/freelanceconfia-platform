import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MessageSquare, 
  Paperclip, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Shield,
  User,
  Calendar,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import escrowPaymentService, { DisputeInfo, EscrowTransaction } from '@/services/escrowPaymentService';

interface DisputeDetailProps {
  disputeId: string;
  onClose: () => void;
}

interface DisputeMessage {
  id: string;
  disputeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userType: 'client' | 'freelancer' | 'admin';
  content: string;
  attachments: {
    id: string;
    name: string;
    type: 'image' | 'document' | 'other';
    url: string;
    size: number;
  }[];
  timestamp: Date;
  isSystemMessage: boolean;
}

const DisputeDetail: React.FC<DisputeDetailProps> = ({ disputeId, onClose }) => {
  const [dispute, setDispute] = useState<DisputeInfo | null>(null);
  const [transaction, setTransaction] = useState<EscrowTransaction | null>(null);
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDisputeDetails();
  }, [disputeId]);

  const loadDisputeDetails = async () => {
    try {
      setLoading(true);
      
      // En una implementación real, necesitarías endpoints específicos para disputas
      // Por ahora simulamos la carga de datos
      
      const mockDispute: DisputeInfo = {
        id: disputeId,
        transactionId: 'tx_123',
        projectId: 'proj_123',
        milestoneId: 'ms_123',
        initiatedBy: 'client',
        reason: 'work_not_delivered',
        description: 'El freelancer no entregó el trabajo acordado en el tiempo establecido.',
        evidence: [
          {
            type: 'text',
            content: 'Conversación por email donde se confirma la fecha de entrega',
            uploadedBy: 'client',
            timestamp: new Date('2024-01-15')
          }
        ],
        status: 'under_review',
        createdAt: new Date('2024-01-15')
      };

      const mockTransaction: EscrowTransaction = {
        id: 'tx_123',
        projectId: 'proj_123',
        milestoneId: 'ms_123',
        freelancerId: 'freelancer_123',
        clientId: 'client_123',
        amount: 1500,
        currency: 'USD',
        fee: 45,
        netAmount: 1455,
        status: 'disputed',
        paymentMethod: 'card',
        metadata: {
          milestoneTitle: 'Diseño de interfaz principal',
          projectTitle: 'Aplicación web de e-commerce',
          clientName: 'María González',
          freelancerName: 'Carlos Rodríguez'
        },
        createdAt: new Date('2024-01-10'),
        timeline: []
      };

      const mockMessages: DisputeMessage[] = [
        {
          id: '1',
          disputeId: disputeId,
          userId: 'client_123',
          userName: 'María González',
          userType: 'client',
          content: 'El freelancer no ha entregado el trabajo acordado. La fecha límite era el 14 de enero y aún no he recibido los archivos.',
          attachments: [],
          timestamp: new Date('2024-01-15T10:00:00Z'),
          isSystemMessage: false
        },
        {
          id: '2',
          disputeId: disputeId,
          userId: 'freelancer_123',
          userName: 'Carlos Rodríguez',
          userType: 'freelancer',
          content: 'Disculpe el retraso. He tenido algunos problemas técnicos, pero el trabajo está 90% completado. Puedo entregarlo mañana por la mañana.',
          attachments: [
            {
              id: 'att_1',
              name: 'progreso_diseño.png',
              type: 'image',
              url: '/uploads/progreso_diseño.png',
              size: 245760
            }
          ],
          timestamp: new Date('2024-01-15T14:30:00Z'),
          isSystemMessage: false
        },
        {
          id: '3',
          disputeId: disputeId,
          userId: 'admin',
          userName: 'Sistema FreelanceConfía',
          userType: 'admin',
          content: 'Un mediador ha sido asignado a esta disputa y revisará el caso en las próximas 24 horas.',
          attachments: [],
          timestamp: new Date('2024-01-15T16:00:00Z'),
          isSystemMessage: true
        }
      ];

      setDispute(mockDispute);
      setTransaction(mockTransaction);
      setMessages(mockMessages);
      
    } catch (error) {
      console.error('Error loading dispute details:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la disputa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    try {
      // En una implementación real, enviarías el mensaje al backend
      const messageData = {
        content: newMessage,
        attachments: attachments
      };

      await escrowPaymentService.respondToDispute(disputeId, newMessage, attachments);

      // Simular agregar el mensaje localmente
      const newMsg: DisputeMessage = {
        id: Date.now().toString(),
        disputeId: disputeId,
        userId: 'current_user',
        userName: 'Usuario Actual',
        userType: 'client', // Esto vendría del contexto de usuario
        content: newMessage,
        attachments: attachments.map((file, index) => ({
          id: `att_${Date.now()}_${index}`,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          url: URL.createObjectURL(file),
          size: file.size
        })),
        timestamp: new Date(),
        isSystemMessage: false
      };

      setMessages([...messages, newMsg]);
      setNewMessage('');
      setAttachments([]);

      toast({
        title: "Mensaje enviado",
        description: "Tu respuesta ha sido enviada"
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'under_review':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'resolved_for_client':
      case 'resolved_for_freelancer':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'yellow';
      case 'under_review':
        return 'blue';
      case 'resolved_for_client':
      case 'resolved_for_freelancer':
        return 'green';
      case 'closed':
        return 'gray';
      default:
        return 'orange';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dispute || !transaction) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Disputa no encontrada</h3>
        <p className="text-gray-600">No se pudieron cargar los detalles de la disputa</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            Disputa #{dispute.id.slice(-6)}
          </h1>
          <p className="text-gray-600">{transaction.metadata.projectTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(dispute.status)}
          <Badge variant={getStatusColor(dispute.status) as any}>
            {dispute.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dispute Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Disputa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Motivo:</h4>
                <p className="text-gray-700">{dispute.reason.replace('_', ' ')}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Descripción:</h4>
                <p className="text-gray-700">{dispute.description}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Evidencia inicial:</h4>
                <div className="space-y-2">
                  {dispute.evidence.map((evidence, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Subido por {evidence.uploadedBy}
                        </span>
                        <span className="text-xs text-gray-500">
                          {evidence.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{evidence.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Conversación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.isSystemMessage ? 'justify-center' : ''}`}>
                    {!message.isSystemMessage && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.userAvatar} />
                        <AvatarFallback>
                          {message.userName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`flex-1 ${message.isSystemMessage ? 'max-w-md mx-auto' : ''}`}>
                      {message.isSystemMessage ? (
                        <Alert>
                          <Shield className="h-4 w-4" />
                          <AlertDescription>
                            {message.content}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">{message.userName}</span>
                            <Badge variant="outline" className="text-xs">
                              {message.userType}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {message.timestamp.toLocaleString()}
                            </span>
                          </div>
                          
                          <p className="text-sm mb-2">{message.content}</p>
                          
                          {message.attachments.length > 0 && (
                            <div className="space-y-2">
                              {message.attachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center gap-2 text-xs bg-white p-2 rounded border">
                                  {attachment.type === 'image' ? (
                                    <ImageIcon className="h-4 w-4" />
                                  ) : (
                                    <FileText className="h-4 w-4" />
                                  )}
                                  <span>{attachment.name}</span>
                                  <span className="text-gray-500">({formatFileSize(attachment.size)})</span>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Message Input */}
              {dispute.status === 'open' || dispute.status === 'under_review' ? (
                <div className="space-y-3">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    rows={3}
                  />
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setAttachments(files);
                      }}
                      className="flex-1"
                    />
                    
                    <Button onClick={handleSendMessage} className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Enviar
                    </Button>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="text-sm text-gray-600">
                      {attachments.length} archivo(s) seleccionado(s)
                    </div>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Esta disputa está cerrada y no se pueden enviar más mensajes.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Transaction Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium">
                  ${transaction.amount} {transaction.currency}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">
                  Cliente: {transaction.metadata.clientName}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">
                  Freelancer: {transaction.metadata.freelancerName}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {transaction.createdAt.toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {dispute.status === 'open' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full">
                  Solicitar mediación
                </Button>
                <Button variant="outline" className="w-full">
                  Proponer solución
                </Button>
                <Button variant="destructive" className="w-full">
                  Escalar disputa
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cronología</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                <span>Disputa iniciada</span>
                <span className="text-gray-500 ml-auto">
                  {dispute.createdAt.toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>En revisión</span>
                <span className="text-gray-500 ml-auto">
                  {dispute.createdAt.toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DisputeDetail;