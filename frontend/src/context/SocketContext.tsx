import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: any) => state.auth.user);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    const socket = io('http://localhost:5000', {
      query: { userId: user.id },
      withCredentials: true,
    });

    setSocket(socket);

    socket.on('notification_created', (notification: { title: string; message: string; type: string }) => {
      const isNegative = notification.type === 'system';
      const show = isNegative ? toast.error : toast.success;

      show(notification.title, {
        description: notification.message,
      });
    });

    return () => {
      socket.off('notification_created');
      socket.disconnect();
      setSocket(null);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
