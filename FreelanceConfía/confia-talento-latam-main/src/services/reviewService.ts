import { apiClient } from '@/lib/api';

export interface Review {
  _id: string;
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5 stars
  comment: string;
  aspects: {
    communication: number;
    quality: number;
    delivery: number;
    professionalism: number;
  };
  projectTitle: string;
  reviewerName: string;
  reviewerAvatar?: string;
  revieweeName: string;
  createdAt: string;
  helpful: number;
  reported: boolean;
  response?: {
    comment: string;
    createdAt: string;
  };
}

export interface CreateReviewData {
  projectId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  aspects: {
    communication: number;
    quality: number;
    delivery: number;
    professionalism: number;
  };
}

export interface ReputationData {
  userId: string;
  overallRating: number;
  totalReviews: number;
  aspectRatings: {
    communication: number;
    quality: number;
    delivery: number;
    professionalism: number;
  };
  badges: Badge[];
  recentReviews: Review[];
  monthlyStats: {
    month: string;
    rating: number;
    reviews: number;
  }[];
}

export interface Badge {
  _id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
  criteria: string;
}

export interface QualityMetrics {
  completionRate: number;
  onTimeDelivery: number;
  clientSatisfaction: number;
  repeatClientRate: number;
  avgProjectValue: number;
  totalEarnings: number;
  responseTime: number; // en horas
  professionalismScore: number;
}

export const reviewService = {
  // Crear una nueva reseña
  async createReview(reviewData: CreateReviewData): Promise<Review> {
    return apiClient.post('/reviews', reviewData);
  },

  // Obtener reseñas de un usuario
  async getUserReviews(userId: string, params?: {
    type?: 'received' | 'given';
    page?: number;
    limit?: number;
    sortBy?: 'newest' | 'rating_high' | 'rating_low' | 'helpful';
  }): Promise<{
    reviews: Review[];
    total: number;
    page: number;
    totalPages: number;
    averageRating: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `/reviews/user/${userId}?${queryParams.toString()}`
      : `/reviews/user/${userId}`;
    
    return apiClient.get(endpoint);
  },

  // Obtener reseñas de un proyecto
  async getProjectReviews(projectId: string): Promise<Review[]> {
    return apiClient.get(`/reviews/project/${projectId}`);
  },

  // Responder a una reseña
  async respondToReview(reviewId: string, response: string): Promise<Review> {
    return apiClient.post(`/reviews/${reviewId}/response`, { response });
  },

  // Marcar reseña como útil
  async markReviewHelpful(reviewId: string): Promise<{ helpful: number }> {
    return apiClient.post(`/reviews/${reviewId}/helpful`);
  },

  // Reportar una reseña
  async reportReview(reviewId: string, reason: string): Promise<void> {
    return apiClient.post(`/reviews/${reviewId}/report`, { reason });
  },

  // Obtener datos de reputación
  async getReputationData(userId: string): Promise<ReputationData> {
    return apiClient.get(`/reputation/${userId}`);
  },

    // Obtener insignias de un usuario
  async getUserBadges(userId: string): Promise<Badge[]> {
    return apiClient.get(`/users/${userId}/badges`);
  },

  // Obtener métricas de calidad de un usuario
  async getQualityMetrics(userId: string): Promise<QualityMetrics> {
    return apiClient.get(`/quality-metrics/${userId}`);
  },

  // Obtener badges disponibles
  async getAvailableBadges(): Promise<{
    earned: Badge[];
    available: Badge[];
    nextToEarn: Badge[];
  }> {
    return apiClient.get('/badges');
  },

  // Obtener estadísticas de reseñas
  async getReviewStats(userId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { stars: number; count: number }[];
    aspectAverages: {
      communication: number;
      quality: number;
      delivery: number;
      professionalism: number;
    };
    trends: {
      month: string;
      rating: number;
      count: number;
    }[];
  }> {
    return apiClient.get(`/reviews/stats/${userId}`);
  },

  // Obtener reseñas pendientes (proyectos completados sin reseña)
  async getPendingReviews(): Promise<{
    projectId: string;
    projectTitle: string;
    otherParty: {
      id: string;
      name: string;
      avatar?: string;
    };
    completedAt: string;
    canReview: boolean;
    deadline: string;
  }[]> {
    return apiClient.get('/reviews/pending');
  },

  // Verificar si puede hacer reseña
  async canReviewProject(projectId: string, revieweeId: string): Promise<{
    canReview: boolean;
    reason?: string;
    deadline?: string;
  }> {
    return apiClient.get(`/reviews/can-review/${projectId}/${revieweeId}`);
  },

  // Obtener reseñas destacadas
  async getFeaturedReviews(userId: string, limit: number = 3): Promise<Review[]> {
    return apiClient.get(`/reviews/featured/${userId}?limit=${limit}`);
  },

  // Actualizar configuración de reseñas
  async updateReviewSettings(settings: {
    emailNotifications: boolean;
    publicProfile: boolean;
    showBadges: boolean;
    highlightPositive: boolean;
  }): Promise<void> {
    return apiClient.patch('/reviews/settings', settings);
  },

  // Obtener configuración de reseñas
  async getReviewSettings(): Promise<{
    emailNotifications: boolean;
    publicProfile: boolean;
    showBadges: boolean;
    highlightPositive: boolean;
  }> {
    return apiClient.get('/reviews/settings');
  }
};

export default reviewService;