import apiClient from './apiClient';

export interface PaymentMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  dueDate?: Date;
  status: 'pending' | 'in_escrow' | 'approved_by_client' | 'released' | 'disputed' | 'refunded';
  createdAt: Date;
  approvedAt?: Date;
  releasedAt?: Date;
  disputedAt?: Date;
  refundedAt?: Date;
}

export interface EscrowTransaction {
  id: string;
  projectId: string;
  milestoneId: string;
  freelancerId: string;
  clientId: string;
  amount: number;
  currency: string;
  fee: number;
  netAmount: number;
  stripePaymentIntentId?: string;
  escrowAccountId?: string;
  status: 'pending' | 'processing' | 'held_in_escrow' | 'released' | 'disputed' | 'refunded' | 'failed';
  paymentMethod: string;
  metadata: {
    milestoneTitle: string;
    projectTitle: string;
    clientName: string;
    freelancerName: string;
  };
  createdAt: Date;
  paidAt?: Date;
  releasedAt?: Date;
  disputedAt?: Date;
  refundedAt?: Date;
  timeline: {
    event: string;
    timestamp: Date;
    description: string;
    actor: string;
  }[];
}

export interface DisputeInfo {
  id: string;
  transactionId: string;
  projectId: string;
  milestoneId: string;
  initiatedBy: 'client' | 'freelancer';
  reason: string;
  description: string;
  evidence: {
    type: 'text' | 'file' | 'image';
    content: string;
    uploadedBy: string;
    timestamp: Date;
  }[];
  status: 'open' | 'under_review' | 'resolved_for_client' | 'resolved_for_freelancer' | 'closed';
  resolution?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  refundAmount?: number;
  createdAt: Date;
}

export interface EscrowStats {
  totalEscrowAmount: number;
  pendingReleases: number;
  activeDisputes: number;
  completedTransactions: number;
  totalFees: number;
  averageHoldTime: number; // in hours
  successRate: number; // percentage
}

class EscrowPaymentService {
  // Crear hito de pago
  async createPaymentMilestone(projectId: string, milestone: Omit<PaymentMilestone, 'id' | 'projectId' | 'createdAt' | 'status'>): Promise<PaymentMilestone> {
    const response = await apiClient.post('/api/escrow/milestones', {
      projectId,
      ...milestone
    });
    return response.data.milestone;
  }

  // Obtener hitos de un proyecto
  async getProjectMilestones(projectId: string): Promise<PaymentMilestone[]> {
    const response = await apiClient.get(`/api/escrow/projects/${projectId}/milestones`);
    return response.data.milestones;
  }

  // Actualizar hito
  async updateMilestone(milestoneId: string, updates: Partial<PaymentMilestone>): Promise<PaymentMilestone> {
    const response = await apiClient.put(`/api/escrow/milestones/${milestoneId}`, updates);
    return response.data.milestone;
  }

  // Iniciar pago hacia escrow
  async initiateEscrowPayment(milestoneId: string, paymentMethod: string): Promise<{ clientSecret: string; transaction: EscrowTransaction }> {
    const response = await apiClient.post('/api/escrow/payment/initiate', {
      milestoneId,
      paymentMethod
    });
    return {
      clientSecret: response.data.clientSecret,
      transaction: response.data.transaction
    };
  }

  // Confirmar pago recibido en escrow
  async confirmEscrowPayment(transactionId: string, paymentIntentId: string): Promise<EscrowTransaction> {
    const response = await apiClient.post('/api/escrow/payment/confirm', {
      transactionId,
      paymentIntentId
    });
    return response.data.transaction;
  }

  // Cliente aprueba trabajo y libera fondos
  async approveAndReleaseFunds(transactionId: string, rating?: number, review?: string): Promise<EscrowTransaction> {
    const response = await apiClient.post('/api/escrow/release', {
      transactionId,
      rating,
      review
    });
    return response.data.transaction;
  }

  // Iniciar disputa
  async initiateDispute(transactionId: string, reason: string, description: string, evidence?: File[]): Promise<DisputeInfo> {
    const formData = new FormData();
    formData.append('transactionId', transactionId);
    formData.append('reason', reason);
    formData.append('description', description);
    
    if (evidence) {
      evidence.forEach((file, index) => {
        formData.append(`evidence_${index}`, file);
      });
    }

    const response = await apiClient.post('/api/escrow/dispute', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.dispute;
  }

  // Responder a disputa
  async respondToDispute(disputeId: string, response: string, evidence?: File[]): Promise<DisputeInfo> {
    const formData = new FormData();
    formData.append('disputeId', disputeId);
    formData.append('response', response);
    
    if (evidence) {
      evidence.forEach((file, index) => {
        formData.append(`evidence_${index}`, file);
      });
    }

    const apiResponse = await apiClient.post('/api/escrow/dispute/respond', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return apiResponse.data.dispute;
  }

  // Obtener transacciones del usuario
  async getUserTransactions(type: 'client' | 'freelancer' = 'freelancer', status?: string): Promise<EscrowTransaction[]> {
    const response = await apiClient.get('/api/escrow/transactions', {
      params: { type, status }
    });
    return response.data.transactions;
  }

  // Obtener detalles de transacción
  async getTransactionDetails(transactionId: string): Promise<{
    transaction: EscrowTransaction;
    milestone: PaymentMilestone;
    dispute?: DisputeInfo;
  }> {
    const response = await apiClient.get(`/api/escrow/transactions/${transactionId}`);
    return response.data;
  }

  // Obtener disputas del usuario
  async getUserDisputes(status?: string): Promise<DisputeInfo[]> {
    const response = await apiClient.get('/api/escrow/disputes', {
      params: { status }
    });
    return response.data.disputes;
  }

  // Obtener estadísticas de escrow
  async getEscrowStats(): Promise<EscrowStats> {
    const response = await apiClient.get('/api/escrow/stats');
    return response.data.stats;
  }

  // Solicitar liberación anticipada (freelancer)
  async requestEarlyRelease(transactionId: string, reason: string): Promise<EscrowTransaction> {
    const response = await apiClient.post('/api/escrow/request-release', {
      transactionId,
      reason
    });
    return response.data.transaction;
  }

  // Extender plazo de hito
  async extendMilestoneDeadline(milestoneId: string, newDueDate: Date, reason: string): Promise<PaymentMilestone> {
    const response = await apiClient.post('/api/escrow/extend-deadline', {
      milestoneId,
      newDueDate: newDueDate.toISOString(),
      reason
    });
    return response.data.milestone;
  }

  // Cancelar hito no pagado
  async cancelMilestone(milestoneId: string, reason: string): Promise<PaymentMilestone> {
    const response = await apiClient.post('/api/escrow/cancel-milestone', {
      milestoneId,
      reason
    });
    return response.data.milestone;
  }

  // Generar reporte de pagos
  async generatePaymentReport(projectId: string): Promise<{
    summary: {
      totalMilestones: number;
      totalAmount: number;
      paidAmount: number;
      pendingAmount: number;
      completedPercentage: number;
    };
    milestones: PaymentMilestone[];
    transactions: EscrowTransaction[];
  }> {
    const response = await apiClient.get(`/api/escrow/reports/project/${projectId}`);
    return response.data.report;
  }

  // Webhook para Stripe events
  async handleStripeWebhook(event: any): Promise<void> {
    await apiClient.post('/api/escrow/webhook/stripe', event);
  }

  // Obtener métodos de pago del usuario
  async getPaymentMethods(): Promise<any[]> {
    const response = await apiClient.get('/api/escrow/payment-methods');
    return response.data.paymentMethods;
  }

  // Agregar método de pago
  async addPaymentMethod(paymentMethodId: string): Promise<any> {
    const response = await apiClient.post('/api/escrow/payment-methods', {
      paymentMethodId
    });
    return response.data.paymentMethod;
  }

  // Eliminar método de pago
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    await apiClient.delete(`/api/escrow/payment-methods/${paymentMethodId}`);
  }

  // Configurar auto-release (liberación automática después de X días)
  async configureAutoRelease(transactionId: string, days: number): Promise<EscrowTransaction> {
    const response = await apiClient.post('/api/escrow/auto-release', {
      transactionId,
      days
    });
    return response.data.transaction;
  }

  // Obtener configuración de tarifas
  async getFeeStructure(): Promise<{
    platformFee: number; // percentage
    stripeFee: number; // percentage
    minimumFee: number; // fixed amount
    refundFee: number; // percentage
  }> {
    const response = await apiClient.get('/api/escrow/fees');
    return response.data.fees;
  }
}

export default new EscrowPaymentService();