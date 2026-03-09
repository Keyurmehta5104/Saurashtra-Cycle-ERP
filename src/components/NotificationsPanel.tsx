import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, UserPlus, Clock, Printer, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationsPanelProps {
  isAdmin: boolean;
}

export default function NotificationsPanel({ isAdmin }: NotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'User Approved',
      message: 'Rajesh Kumar has been approved as an employee.',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'New Registration',
      message: 'Priya Sharma registered as an employee and requires approval.',
      timestamp: new Date(Date.now() - 7200000),
      read: false,
      action: {
        label: 'Review',
        onClick: () => {
          console.log('Review clicked');
          // Navigate to user management or show approval dialog
          alert('Opening approval form for Priya Sharma...');
        }
      }
    },
    {
      id: '3',
      type: 'info',
      title: 'System Update',
      message: 'Inventory management system has been updated.',
      timestamp: new Date(Date.now() - 86400000),
      read: true,
    },
    {
      id: '4',
      type: 'error',
      title: 'Low Stock Alert',
      message: 'Brake Pads inventory is running low (only 5 units left).',
      timestamp: new Date(Date.now() - 1800000),
      read: false,
      action: {
        label: 'View',
        onClick: () => {
          console.log('View clicked');
          // Navigate to inventory page
          alert('Navigating to inventory page for Brake Pads...');
        }
      }
    }
  ]);

  const [showPanel, setShowPanel] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handlePrint = () => {
    const printContent = notifications.map(n => 
      `[${n.type.toUpperCase()}] ${n.title}\n${n.message}\nTime: ${n.timestamp.toLocaleString()}\nStatus: ${n.read ? 'Read' : 'Unread'}\n`
    ).join('\n---\n\n');
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Notifications Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { color: #333; border-bottom: 2px solid #000; padding-bottom: 10px; }
              .notification { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
              .type { font-weight: bold; color: #666; }
              .title { font-size: 16px; font-weight: bold; margin: 10px 0; }
              .message { color: #444; margin: 10px 0; }
              .time { color: #999; font-size: 12px; margin-top: 10px; }
              .status { color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <h1>Notifications Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <div class="notifications">
              ${notifications.map(n => `
                <div class="notification">
                  <div class="type">[${n.type.toUpperCase()}]</div>
                  <div class="title">${n.title}</div>
                  <div class="message">${n.message}</div>
                  <div class="time">Time: ${n.timestamp.toLocaleString()}</div>
                  <div class="status">Status: ${n.read ? 'Read' : 'Unread'}</div>
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    let content = 'NOTIFICATIONS REPORT\n';
    content += 'Generated: ' + new Date().toLocaleString() + '\n';
    content += '='.repeat(50) + '\n\n';
    
    notifications.forEach(n => {
      content += `[${n.type.toUpperCase()}] ${n.title}\n`;
      content += `${n.message}\n`;
      content += `Time: ${n.timestamp.toLocaleString()}\n`;
      content += `Status: ${n.read ? 'Read' : 'Unread'}\n`;
      content += '\n---\n\n';
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notifications-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-destructive/30 bg-destructive/5';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  // Allow all users to see notifications - removing admin-only restriction
  /*
  if (!isAdmin) {
    return null;
  }
  */

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-sidebar-accent/50"
        onClick={() => setShowPanel(!showPanel)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </Button>

      {showPanel && (
        <div className="absolute left-full top-0 ml-2 w-[360px] max-w-[calc(100vw-280px)] bg-background border rounded-lg shadow-lg z-[100] animate-slide-in-left">
          <div className="flex flex-col h-full max-h-[calc(100vh-64px)]">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b bg-card">
              <h3 className="font-semibold text-base">Notifications</h3>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrint} 
                  className="h-7 text-xs" 
                  title="Print notifications"
                >
                  <Printer className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownload} 
                  className="h-7 text-xs" 
                  title="Download notifications"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={markAllAsRead} 
                    className="h-7 text-xs"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
            
            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="flex flex-col gap-2">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-2.5 rounded-lg border ${getTypeColor(notification.type)} ${!notification.read ? 'ring-1 ring-ring' : ''}`}
                    >
                      <div className="flex gap-2.5">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          {/* Header: Title + Badge + Close */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate" title={notification.title}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <Badge variant="secondary" className="text-xs h-4.5 px-1 flex-shrink-0">
                                  New
                                </Badge>
                              )}
                            </div>
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Close notification"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          {/* Message body with line clamping */}
                          <p className="text-xs text-muted-foreground leading-relaxed break-words word-break line-clamp-2">
                            {notification.message}
                          </p>
                          
                          {/* Timestamp */}
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{notification.timestamp.toLocaleString()}</span>
                          </p>
                          
                          {/* Action button */}
                          {notification.action && (
                            <div className="flex justify-end pt-0.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  notification.action?.onClick();
                                  markAsRead(notification.id);
                                }}
                                className="h-7 text-xs"
                              >
                                {notification.action.label}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}