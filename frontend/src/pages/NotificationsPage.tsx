import { useEffect, useMemo, useState } from 'react';
import { Bell, Check, Trash2, DollarSign, CalendarDays, Megaphone, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import api from '@/utils/api';
import { useSocket } from '@/context/SocketContext';

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  type: 'leave' | 'payroll' | 'announcement' | 'system';
  createdAt: string;
  read: boolean;
};

const typeConfig = {
  leave: { icon: CalendarDays, color: 'bg-blue-500/10 text-blue-500' },
  payroll: { icon: DollarSign, color: 'bg-green-500/10 text-green-500' },
  announcement: { icon: Megaphone, color: 'bg-amber-500/10 text-amber-500' },
  system: { icon: Settings, color: 'bg-violet-500/10 text-violet-500' },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000 / 60);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function NotificationsPage() {
  const user = useSelector((state: any) => state.auth.user);
  const socket = useSocket();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const displayed = useMemo(() => {
    if (filter === 'unread') return notifications.filter(n => !n.read);
    if (filter === 'read') return notifications.filter(n => n.read);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/notifications/user/${user.id}`);
      setNotifications(res.data.notifications ?? []);
    } catch (err) {
      toast.error('Failed to load notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  useEffect(() => {
    if (!socket) return;

    const handleCreated = (notification: NotificationItem) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on('notification_created', handleCreated);

    return () => {
      socket.off('notification_created', handleCreated);
    };
  }, [socket]);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllRead = async () => {
    if (!user?.id) return;
    try {
      await api.patch(`/notifications/user/${user.id}/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteN = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const handleBroadcast = async () => {
    try {
      await api.post('/notifications/create', {
        title: 'Company Announcement',
        message: 'New policy update available. Please check the portal.',
        type: 'announcement',
        targetRole: 'Employee',
      });
      toast.success('Broadcast sent to all employees!');
    } catch (err) {
      toast.error('Failed to send broadcast');
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Notifications</h1>
            {unreadCount > 0 && <Badge className="bg-destructive text-destructive-foreground text-[10px] h-5 px-1.5">{unreadCount}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{unreadCount} unread notifications</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'Manager' && (
            <Button size="sm" className="h-8 text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 font-bold" onClick={handleBroadcast}>
              <Megaphone className="w-3.5 h-3.5" />Broadcast
            </Button>
          )}
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={markAllRead}>
              <Check className="w-3.5 h-3.5" />Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'unread', 'read'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted")}>
            {f}{f === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {displayed.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayed.map(n => {
              const { icon: Icon, color } = (typeConfig as any)[n.type] || { icon: Bell, color: 'bg-muted text-muted-foreground' };
              return (
                <div key={n._id} className={cn("flex items-start gap-4 p-4 hover:bg-muted/20 transition-colors group", !n.read && "bg-primary/[0.02]")}>
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm font-medium", !n.read ? "text-foreground" : "text-muted-foreground")}>{n.title}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        <span className="text-[10px] text-muted-foreground">{formatTime(n.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.read && (
                        <button onClick={() => markRead(n._id)} className="text-[10px] text-primary hover:underline flex items-center gap-1">
                          <Check className="w-3 h-3" />Mark read
                        </button>
                      )}
                      <button onClick={() => deleteN(n._id)} className="text-[10px] text-destructive hover:underline flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
