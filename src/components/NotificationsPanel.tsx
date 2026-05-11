import { useEffect, useMemo, useState } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, Clock, Printer, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';

type ActivityAction = 'login' | 'logout' | 'register' | 'approve' | 'reject' | 'profile_update';

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: ActivityAction;
  timestamp?: Timestamp;
  details?: string;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsPanelProps {
  isAdmin: boolean;
}

export default function NotificationsPanel({ isAdmin }: NotificationsPanelProps) {
  const { user } = useAuth();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.ACTIVITY_LOGS),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ActivityLog, 'id'>),
        }));
        setActivityLogs(logs.slice(0, 50));
      },
      (error) => {
        console.error('Notifications listener error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const notifications = useMemo(() => {
    const visibleLogs = activityLogs.filter((log) => {
      if (hiddenIds.has(log.id)) return false;
      if (isAdmin) return true;
      return user ? log.userId === user.uid : false;
    });

    return visibleLogs.map((log) => {
      let type: Notification['type'] = 'info';
      let title = 'System Activity';
      let message = log.details || '';

      switch (log.action) {
        case 'login':
          type = 'success';
          title = 'User Login';
          message = `${log.userName} (${log.userEmail}) logged in.`;
          break;
        case 'logout':
          type = 'info';
          title = 'User Logout';
          message = `${log.userName} (${log.userEmail}) logged out.`;
          break;
        case 'register':
          type = 'warning';
          title = 'New Registration';
          message = `${log.userName} (${log.userEmail}) created a new account.`;
          break;
        case 'approve':
          type = 'success';
          title = 'User Approved';
          message = log.details || `${log.userName} was approved.`;
          break;
        case 'reject':
          type = 'error';
          title = 'User Rejected';
          message = log.details || `${log.userName} was rejected.`;
          break;
        case 'profile_update':
          type = 'info';
          title = 'Profile Updated';
          message = log.details || `${log.userName} updated profile details.`;
          break;
      }

      return {
        id: log.id,
        type,
        title,
        message,
        timestamp: log.timestamp?.toDate() || new Date(),
        read: readIds.has(log.id),
      };
    });
  }, [activityLogs, hiddenIds, isAdmin, readIds, user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  const markAllAsRead = () => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      return next;
    });
  };

  const deleteNotification = (id: string) => {
    setHiddenIds((prev) => new Set(prev).add(id));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Notifications Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { border-bottom: 2px solid #000; padding-bottom: 10px; }
            .notification { margin: 16px 0; padding: 12px; border: 1px solid #ddd; border-radius: 6px; }
            .title { font-weight: 700; margin-bottom: 6px; }
            .meta { font-size: 12px; color: #555; }
          </style>
        </head>
        <body>
          <h1>Notifications Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          ${notifications
            .map(
              (n) => `
                <div class="notification">
                  <div class="title">[${n.type.toUpperCase()}] ${n.title}</div>
                  <div>${n.message}</div>
                  <div class="meta">${n.timestamp.toLocaleString()} • ${n.read ? 'Read' : 'Unread'}</div>
                </div>
              `
            )
            .join('')}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    let content = `NOTIFICATIONS REPORT\nGenerated: ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n`;
    notifications.forEach((n) => {
      content += `[${n.type.toUpperCase()}] ${n.title}\n`;
      content += `${n.message}\n`;
      content += `Time: ${n.timestamp.toLocaleString()}\n`;
      content += `Status: ${n.read ? 'Read' : 'Unread'}\n\n`;
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

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-destructive/30 bg-destructive/5';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

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
            <div className="flex items-center justify-between px-3 py-2.5 border-b bg-card">
              <h3 className="font-semibold text-base">Notifications</h3>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={handlePrint} className="h-7 text-xs" title="Print notifications">
                  <Printer className="w-3.5 h-3.5" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="h-7 text-xs" title="Download notifications">
                  <Download className="w-3.5 h-3.5" />
                </Button>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead} className="h-7 text-xs">
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="flex flex-col gap-2">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-2.5 rounded-lg border ${getTypeColor(notification.type)} ${!notification.read ? 'ring-1 ring-ring' : ''}`}
                    >
                      <div className="flex gap-2.5">
                        <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0 space-y-1.5">
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

                          <p className="text-xs text-muted-foreground leading-relaxed break-words line-clamp-2">{notification.message}</p>

                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{notification.timestamp.toLocaleString()}</span>
                          </p>
                        </div>
                      </div>

                      {!notification.read && (
                        <div className="flex justify-end pt-2">
                          <Button size="sm" variant="outline" onClick={() => markAsRead(notification.id)} className="h-7 text-xs">
                            Mark read
                          </Button>
                        </div>
                      )}
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
