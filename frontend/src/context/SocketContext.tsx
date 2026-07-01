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

    // Listen for leave status updates
    socket.on('leave_status_updated', (data: { status: string; leaveType: string; message: string }) => {
      if (data.status === 'approved') {
        toast.success(`✅ Leave ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`, {
          description: data.message,
        });
      } else {
        toast.error(`❌ Leave ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}`, {
          description: data.message,
        });
      }
    });

    return () => {
      socket.off('leave_status_updated');
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
