import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
}

interface ChatContextType {
  socket: Socket | null;
  messages: Message[];
  isConnected: boolean;
  sendMessage: (content: string, receiverId: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Conectar a Socket.io
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('authToken'),
          userId: user._id
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setIsConnected(false);
      });

      newSocket.on('message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('messageHistory', (history: Message[]) => {
        setMessages(history);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setMessages([]);
    }
  }, [isAuthenticated, user]);

  const sendMessage = (content: string, receiverId: string) => {
    if (socket && user) {
      const message = {
        content,
        receiverId,
        senderId: user._id,
        timestamp: new Date()
      };
      
      socket.emit('sendMessage', message);
    }
  };

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit('joinRoom', roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket) {
      socket.emit('leaveRoom', roomId);
    }
  };

  const value = {
    socket,
    messages,
    isConnected,
    sendMessage,
    joinRoom,
    leaveRoom,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}