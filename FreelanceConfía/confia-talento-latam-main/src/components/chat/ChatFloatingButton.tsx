import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ChatWindow from './ChatWindow';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';

interface ChatFloatingButtonProps {
  recipientId?: string;
  recipientName?: string;
  recipientAvatar?: string;
}

const ChatFloatingButton = ({ 
  recipientId = 'demo-user', 
  recipientName = 'Soporte FreelanceConfía',
  recipientAvatar 
}: ChatFloatingButtonProps) => {
  const { isAuthenticated } = useAuth();
  const { messages, isConnected } = useChat();
  const [isOpen, setIsOpen] = useState(false);

  // Contar mensajes no leídos (simulado)
  const unreadCount = 2;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50">
        <div className="relative">
          <Button
            onClick={() => setIsOpen(!isOpen)}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
          
          {/* Indicador de conexión */}
          <div 
            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              isConnected ? 'bg-green-400' : 'bg-gray-400'
            }`}
          />
          
          {/* Badge de mensajes no leídos */}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>

      <ChatWindow
        recipientId={recipientId}
        recipientName={recipientName}
        recipientAvatar={recipientAvatar}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default ChatFloatingButton;