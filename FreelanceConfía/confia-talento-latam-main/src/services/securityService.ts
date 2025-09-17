import { apiClient } from '@/lib/api';

export interface SecurityValidation {
  id: string;
  type: 'identity' | 'payment' | 'fraud' | 'transaction';
  status: 'pending' | 'approved' | 'rejected' | 'requires_action';
  userId: string;
  data: any;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IdentityVerificationData {
  documentType: 'passport' | 'id_card' | 'driver_license';
  documentNumber: string;
  documentImages: File[];
  selfieImage: File;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  birthDate: string;
}

export interface PaymentValidationData {
  paymentMethod: 'bank_account' | 'card' | 'digital_wallet';
  accountDetails: any;
  verificationAmount?: number;
  bankStatement?: File;
}

export interface FraudDetectionData {
  ipAddress: string;
  deviceFingerprint: string;
  behaviorMetrics: {
    loginFrequency: number;
    projectCreationRate: number;
    messagePatterns: any;
    paymentPatterns: any;
  };
  riskScore: number;
  riskFactors: string[];
}

export interface TransactionLimits {
  daily: number;
  weekly: number;
  monthly: number;
  perTransaction: number;
  unverifiedDaily: number;
  unverifiedPerTransaction: number;
}

export interface SecurityReport {
  userId: string;
  type: 'spam' | 'fraud' | 'inappropriate' | 'fake_profile' | 'payment_issue';
  description: string;
  evidence?: File[];
  reportedUserId?: string;
  projectId?: string;
  messageId?: string;
}

export const securityService = {
  // Verificación de identidad
  async submitIdentityVerification(data: IdentityVerificationData): Promise<SecurityValidation> {
    const formData = new FormData();
    formData.append('documentType', data.documentType);
    formData.append('documentNumber', data.documentNumber);
    formData.append('address', JSON.stringify(data.address));
    formData.append('birthDate', data.birthDate);
    
    data.documentImages.forEach((file, index) => {
      formData.append(`documentImage${index}`, file);
    });
    formData.append('selfieImage', data.selfieImage);

    return apiClient.post('/security/identity-verification', formData);
  },

  // Verificación de método de pago
  async submitPaymentVerification(data: PaymentValidationData): Promise<SecurityValidation> {
    const formData = new FormData();
    formData.append('paymentMethod', data.paymentMethod);
    formData.append('accountDetails', JSON.stringify(data.accountDetails));
    
    if (data.verificationAmount) {
      formData.append('verificationAmount', data.verificationAmount.toString());
    }
    
    if (data.bankStatement) {
      formData.append('bankStatement', data.bankStatement);
    }

    return apiClient.post('/security/payment-verification', formData);
  },

  // Obtener estado de verificaciones
  async getVerificationStatus(): Promise<{
    identity: SecurityValidation | null;
    payment: SecurityValidation | null;
    overall: 'unverified' | 'partial' | 'verified';
  }> {
    return apiClient.get('/security/verification-status');
  },

  // Análisis de fraude
  async analyzeFraudRisk(data: Partial<FraudDetectionData>): Promise<{
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
    recommendations: string[];
    blocked: boolean;
  }> {
    return apiClient.post('/security/fraud-analysis', data);
  },

  // Obtener límites de transacción
  async getTransactionLimits(): Promise<TransactionLimits> {
    return apiClient.get('/security/transaction-limits');
  },

  // Validar transacción antes de procesarla
  async validateTransaction(data: {
    amount: number;
    currency: string;
    type: 'payment' | 'withdrawal' | 'escrow';
    recipientId?: string;
    projectId?: string;
  }): Promise<{
    approved: boolean;
    reason?: string;
    requiredActions?: string[];
    estimatedDelay?: number;
  }> {
    return apiClient.post('/security/validate-transaction', data);
  },

  // Reportar actividad sospechosa
  async submitSecurityReport(data: SecurityReport): Promise<{
    reportId: string;
    status: 'received' | 'under_review' | 'resolved';
  }> {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('description', data.description);
    
    if (data.reportedUserId) formData.append('reportedUserId', data.reportedUserId);
    if (data.projectId) formData.append('projectId', data.projectId);
    if (data.messageId) formData.append('messageId', data.messageId);
    
    data.evidence?.forEach((file, index) => {
      formData.append(`evidence${index}`, file);
    });

    return apiClient.post('/security/report', formData);
  },

  // Obtener actividad de seguridad
  async getSecurityActivity(): Promise<{
    recentLogins: Array<{
      timestamp: string;
      ipAddress: string;
      location: string;
      device: string;
      suspicious: boolean;
    }>;
    verificationHistory: SecurityValidation[];
    securityAlerts: Array<{
      type: string;
      message: string;
      timestamp: string;
      resolved: boolean;
    }>;
  }> {
    return apiClient.get('/security/activity');
  },

  // Configurar autenticación de dos factores
  async setup2FA(): Promise<{
    qrCode: string;
    backupCodes: string[];
    secret: string;
  }> {
    return apiClient.post('/security/2fa/setup');
  },

  // Verificar código 2FA
  async verify2FA(code: string): Promise<{
    verified: boolean;
    enabled: boolean;
  }> {
    return apiClient.post('/security/2fa/verify', { code });
  },

  // Deshabilitar 2FA
  async disable2FA(password: string): Promise<{
    disabled: boolean;
  }> {
    return apiClient.post('/security/2fa/disable', { password });
  },

  // Obtener configuración de seguridad
  async getSecuritySettings(): Promise<{
    twoFactorEnabled: boolean;
    identityVerified: boolean;
    paymentVerified: boolean;
    loginAlerts: boolean;
    transactionAlerts: boolean;
    securityLevel: 'basic' | 'standard' | 'high';
  }> {
    return apiClient.get('/security/settings');
  },

  // Actualizar configuración de seguridad
  async updateSecuritySettings(settings: {
    loginAlerts?: boolean;
    transactionAlerts?: boolean;
    securityLevel?: 'basic' | 'standard' | 'high';
  }): Promise<void> {
    return apiClient.patch('/security/settings', settings);
  },

  // Bloquear/desbloquear cuenta temporalmente
  async toggleAccountLock(reason: string): Promise<{
    locked: boolean;
    unlockDate?: string;
  }> {
    return apiClient.post('/security/account/toggle-lock', { reason });
  }
};

export default securityService;