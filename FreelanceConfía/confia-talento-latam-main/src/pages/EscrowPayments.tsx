import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import EscrowDashboard from '@/components/escrow/EscrowDashboard';

const EscrowPaymentsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  
  // En una implementación real, obtendrías el tipo de usuario del contexto de autenticación
  const userType: 'client' | 'freelancer' = 'client'; // Esto debería venir del contexto de auth

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <EscrowDashboard 
          projectId={projectId} 
          userType={userType}
        />
      </main>
      <Footer />
    </div>
  );
};

export default EscrowPaymentsPage;