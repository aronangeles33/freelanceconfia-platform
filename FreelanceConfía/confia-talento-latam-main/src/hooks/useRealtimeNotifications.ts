import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useChat } from '@/contexts/ChatContext';

export const useRealtimeNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const { socket } = useChat();

  useEffect(() => {
    if (!socket || !isAuthenticated || !user) return;

    // Escuchar notificaciones en tiempo real
    const handleNewNotification = (notification: any) => {
      addNotification({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
      });
    };

    // Escuchar nuevas aplicaciones a proyectos
    const handleNewApplication = (data: any) => {
      if (data.clientId === user._id) {
        addNotification({
          type: 'application',
          title: 'Nueva aplicación recibida',
          message: `${data.freelancerName} ha aplicado a tu proyecto "${data.projectTitle}"`,
          data: {
            projectId: data.projectId,
            applicationId: data.applicationId,
          },
        });
      }
    };

    // Escuchar cambios de estado en aplicaciones
    const handleApplicationUpdate = (data: any) => {
      if (data.freelancerId === user._id) {
        const statusMessage = data.status === 'accepted' 
          ? 'Tu aplicación ha sido aceptada' 
          : 'Tu aplicación ha sido rechazada';
        
        addNotification({
          type: 'application',
          title: 'Actualización de aplicación',
          message: `${statusMessage} para el proyecto "${data.projectTitle}"`,
          data: {
            projectId: data.projectId,
            applicationId: data.applicationId,
          },
        });
      }
    };

    // Escuchar nuevos proyectos (para freelancers)
    const handleNewProject = (data: any) => {
      if (user.role === 'freelancer' && data.category && user.skills) {
        // Verificar si el proyecto coincide con las habilidades del freelancer
        const hasMatchingSkills = data.skills.some((skill: string) => 
          user.skills?.includes(skill)
        );

        if (hasMatchingSkills) {
          addNotification({
            type: 'project',
            title: 'Nuevo proyecto disponible',
            message: `Nuevo proyecto en ${data.category}: "${data.title}"`,
            data: {
              projectId: data.projectId,
            },
          });
        }
      }
    };

    // Escuchar nuevos mensajes
    const handleNewMessage = (data: any) => {
      if (data.recipientId === user._id) {
        addNotification({
          type: 'message',
          title: 'Nuevo mensaje',
          message: `Tienes un nuevo mensaje de ${data.senderName}`,
          data: {
            messageId: data.messageId,
            senderId: data.senderId,
          },
        });
      }
    };

    // Escuchar actualizaciones de pagos
    const handlePaymentUpdate = (data: any) => {
      if (data.userId === user._id) {
        addNotification({
          type: 'payment',
          title: 'Actualización de pago',
          message: data.message,
          data: {
            paymentId: data.paymentId,
            projectId: data.projectId,
          },
        });
      }
    };

    // Registrar eventos
    socket.on('notification', handleNewNotification);
    socket.on('newApplication', handleNewApplication);
    socket.on('applicationUpdate', handleApplicationUpdate);
    socket.on('newProject', handleNewProject);
    socket.on('newMessage', handleNewMessage);
    socket.on('paymentUpdate', handlePaymentUpdate);

    // Limpiar eventos al desmontar
    return () => {
      socket.off('notification', handleNewNotification);
      socket.off('newApplication', handleNewApplication);
      socket.off('applicationUpdate', handleApplicationUpdate);
      socket.off('newProject', handleNewProject);
      socket.off('newMessage', handleNewMessage);
      socket.off('paymentUpdate', handlePaymentUpdate);
    };
  }, [socket, isAuthenticated, user, addNotification]);
};

export default useRealtimeNotifications;