import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';

interface ChatWindowProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChatWindow = ({ 
  recipientId, 
  recipientName, 
  recipientAvatar, 
  isOpen, 
  onClose 
}: ChatWindowProps) => {
  const { user } = useAuth();
  const { messages, sendMessage, isConnected } = useChat();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filtrar mensajes para esta conversación
  const conversationMessages = messages.filter(
    msg => 
      (msg.sender === user?._id && recipientId) ||
      (msg.sender === recipientId && user?._id)
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() && user) {
      sendMessage(messageText.trim(), recipientId);
      setMessageText('');
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white shadow-2xl rounded-lg border z-50">
      <Card className="h-full flex flex-col">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={recipientAvatar} alt={recipientName} />
                <AvatarFallback>
                  {recipientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isConnected && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-sm">{recipientName}</h3>
              <p className="text-xs text-gray-500">
                {isConnected ? 'En línea' : 'Desconectado'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-64 p-4">
            <div className="space-y-3">
              {conversationMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">No hay mensajes aún</p>
                  <p className="text-xs">Inicia la conversación</p>
                </div>
              ) : (
                conversationMessages.map((message, index) => {
                  const isOwn = message.sender === user?._id;
                  return (
                    <div
                      key={index}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? 'text-primary-foreground/70' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="pr-10"
                disabled={!isConnected}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              type="submit" 
              size="sm" 
              className="h-8 w-8 p-0 flex-shrink-0"
              disabled={!messageText.trim() || !isConnected}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {!isConnected && (
            <div className="mt-2">
              <Badge variant="destructive" className="text-xs">
                Desconectado del chat
              </Badge>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ChatWindow;