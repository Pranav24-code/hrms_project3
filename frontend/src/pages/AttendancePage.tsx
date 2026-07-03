import { useState, useEffect } from 'react';
import { mockAttendance } from '@/constants/mockData';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { UserCheck, UserX, Clock, AlertCircle, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSelector } from "react-redux";
import api from "@/utils/api";

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  present: { label: 'Present', className: 'bg-green-500/10 text-green-600 border-green-500/20', icon: UserCheck },
  absent: { label: 'Absent', className: 'bg-red-500/10 text-red-600 border-red-500/20', icon: UserX },
  late: { label: 'Late', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock },
  half_day: { label: 'Half Day', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: AlertCircle },
  on_leave: { label: 'On Leave', className: 'bg-violet-500/10 text-violet-600 border-violet-500/20', icon: Clock },
};

export default function AttendancePage() {
  const user = useSelector((state: any) => state.auth.user);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [attendance, setAttendance] = useState([]);
const [stats, setStats] = useState({
  present: 0,
  absent: 0,
  late: 0,
  onLeave: 0,
});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

const handleAction = async () => {
  try {
    if (!checkedIn) {
      await api.post("/attendance/checkin", {
        employeeId: user.id,
      });

      toast.success("Checked in successfully");
      setCheckedIn(true);
    } else {
      await api.post("/attendance/checkout", {
        employeeId: user.id,
      });

      toast.success("Checked out successfully");
      setCheckedIn(false);
    }

    fetchAttendance();
    fetchStats();
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ||
      "Something went wrong"
    );
  }
};

const present = stats.present;
const absent = stats.absent;
const late = stats.late;
const onLeave = stats.onLeave;

 useEffect(() => {
  fetchAttendance();
  fetchStats();

  if (user?.id) {
    checkTodayStatus();
  }
}, [user]);

const checkTodayStatus = async () => {
  try {
    const res = await api.get(
      `/attendance/today/${user.id}`
    );

    const attendance = res.data.attendance;

    if (
      attendance &&
      attendance.checkIn &&
      !attendance.checkOut
    ) {
      setCheckedIn(true);
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchAttendance = async () => {
  try {
    const res = await api.get("/attendance/today");

    setAttendance(res.data.attendance);
  } catch (error) {
    console.error(error);
  }
};

const fetchStats = async () => {
  try {
    const res = await api.get("/attendance/stats");

    setStats(res.data.stats);
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Attendance</h1>
          <p className="text-sm text-muted-foreground">Today's attendance — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        {user?.role === 'Employee' && (
          <div className="bg-card border border-border p-3 px-5 rounded-2xl flex items-center gap-6 shadow-sm">
            <div className="text-center md:text-left">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Current Time</p>
              <p className="text-lg font-mono font-bold text-primary">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <Button 
              onClick={handleAction}
              variant={checkedIn ? "destructive" : "default"}
              className="h-10 px-6 gap-2 font-bold shadow-lg"
            >
              {checkedIn ? <><LogOut className="w-4 h-4" /> Check Out</> : <><LogIn className="w-4 h-4" /> Check In</>}
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Present', value: present, icon: UserCheck, color: 'green' },
          { label: 'Absent', value: absent, icon: UserX, color: 'red' },
          { label: 'Late Arrival', value: late, icon: Clock, color: 'amber' },
          { label: 'On Leave', value: onLeave, icon: AlertCircle, color: 'violet' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3",
                s.color === 'green' ? 'bg-green-500/10' : s.color === 'red' ? 'bg-red-500/10' :
                s.color === 'amber' ? 'bg-amber-500/10' : 'bg-violet-500/10')}>
                <Icon className={cn("w-4 h-4",
                  s.color === 'green' ? 'text-green-500' : s.color === 'red' ? 'text-red-500' :
                  s.color === 'amber' ? 'text-amber-500' : 'text-violet-500')} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Attendance Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold">Today's Attendance Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Employee', 'Department', 'Check-In', 'Check-Out', 'Working Hours', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attendance.map((a: any) => (
                <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                          {a.employee?.name 
                            ? a.employee.name.split(' ').map((n: any) => n[0]).join('') 
                            : (a.employeeName ? a.employeeName.split(' ').map((n: any) => n[0]).join('') : 'E')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{a.employeeName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{a.department}</td>
                  <td className="px-4 py-3 text-xs font-mono">{a.checkIn || '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono">{a.checkOut || '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono">{a.workingHours ? `${a.workingHours}h` : '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("text-[10px]", statusConfig[a.status].className)}>
                      {statusConfig[a.status].label}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
