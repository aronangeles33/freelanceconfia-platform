import React from 'react';
import { Bell, Check, X, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, type Notification } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotifications();

  const getNotificationIcon = (type: Notification['type']) => {
    const iconClass = "h-4 w-4";
    
    switch (type) {
      case 'project':
        return <div className={`${iconClass} bg-blue-500 rounded-full`} />;
      case 'application':
        return <div className={`${iconClass} bg-green-500 rounded-full`} />;
      case 'message':
        return <div className={`${iconClass} bg-purple-500 rounded-full`} />;
      case 'payment':
        return <div className={`${iconClass} bg-yellow-500 rounded-full`} />;
      case 'system':
        return <div className={`${iconClass} bg-gray-500 rounded-full`} />;
      default:
        return <div className={`${iconClass} bg-gray-400 rounded-full`} />;
    }
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'project':
        return notification.data?.projectId ? `/project/${notification.data.projectId}` : '/dashboard';
      case 'application':
        return notification.data?.projectId ? `/project/${notification.data.projectId}` : '/dashboard';
      case 'message':
        return '/dashboard'; // O a la página de chat específica
      case 'payment':
        return '/dashboard'; // O a la página de pagos
      default:
        return '/dashboard';
    }
  };

  const formatTime = (createdAt: string) => {
    return formatDistanceToNow(new Date(createdAt), {
      addSuffix: true,
      locale: es,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificaciones</h3>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                Marcar todas
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div key={notification.id} className="mb-2">
                  <Link
                    to={getNotificationLink(notification)}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div
                      className={`p-3 rounded-lg border transition-colors hover:bg-gray-50 ${
                        !notification.read
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium truncate ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.read && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 hover:bg-red-100"
                              >
                                <X className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link to="/notifications">
                <Button variant="ghost" className="w-full text-sm">
                  Ver todas las notificaciones
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;