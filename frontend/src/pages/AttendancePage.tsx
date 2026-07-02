import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { UserCheck, UserX, Clock, AlertCircle, LogIn, LogOut, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSelector } from "react-redux";
import api from "@/utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import * as XLSX from 'xlsx';

type AttendanceSession = {
  checkIn: string;
  checkOut?: string | null;
  workingHours?: number;
};

type AttendanceRecord = {
  _id: string;
  date?: string;
  employee?: {
    name?: string;
    email?: string;
    employeeId?: string;
  };
  checkIn?: string | null;
  checkOut?: string | null;
  workingHours?: number;
  sessions?: AttendanceSession[];
  status: string;
};

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
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
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
    fetchHistory();
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
  fetchHistory();

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
    const sessions = attendance?.sessions ?? [];
    const lastSession = sessions[sessions.length - 1];

    if (
      lastSession &&
      lastSession.checkIn &&
      !lastSession.checkOut
    ) {
      setCheckedIn(true);
    } else {
      setCheckedIn(false);
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchAttendance = async () => {
  try {
    const res = await api.get("/attendance/today");

    setAttendance(res.data.attendance ?? []);
  } catch (error) {
    console.error(error);
  }
};

const fetchHistory = async () => {
  if (!user?.id) return;

  try {
    setHistoryLoading(true);

    const endpoint = user?.role === 'Manager'
      ? '/attendance/history'
      : `/attendance/history?employeeId=${user.id}`;

    const res = await api.get(endpoint);
    setHistory(res.data.attendance ?? []);
  } catch (error) {
    console.error(error);
    toast.error('Failed to load attendance history');
  } finally {
    setHistoryLoading(false);
  }
};

const formatTime = (iso?: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

const formatSessionHours = (session: AttendanceSession) => {
  if (typeof session.workingHours === 'number') {
    return `${session.workingHours.toFixed(2)}h`;
  }

  if (session.checkOut) {
    const hours =
      (new Date(session.checkOut).getTime() - new Date(session.checkIn).getTime()) /
      (1000 * 60 * 60);
    return `${hours.toFixed(2)}h`;
  }

  return 'In Progress';
};

const fetchStats = async () => {
  try {
    const res = await api.get("/attendance/stats");

    setStats(res.data.stats);
  } catch (error) {
    console.error(error);
  }
};

const getHistoryRows = () => {
  return history.flatMap((record) => {
    const sessions = record.sessions?.length
      ? record.sessions
      : [{ checkIn: record.checkIn ?? '', checkOut: record.checkOut ?? null, workingHours: record.workingHours ?? 0 }];

    return sessions.map((session, index) => ({
      Date: formatDate(record.date),
      Employee: record.employee?.name || '—',
      EmployeeId: record.employee?.employeeId || '—',
      Email: record.employee?.email || '—',
      Status: statusConfig[record.status]?.label || record.status,
      Session: index + 1,
      CheckIn: formatTime(session.checkIn),
      CheckOut: formatTime(session.checkOut),
      WorkingHours: formatSessionHours(session),
    }));
  });
};

const handleDownloadHistory = () => {
  const rows = getHistoryRows();

  if (rows.length === 0) {
    toast.error('No attendance history available to export');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance History');

  const fileName = user?.role === 'Manager'
    ? 'team-attendance-history'
    : 'my-attendance-history';

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
  toast.success('Attendance history downloaded');
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

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Attendance History</h3>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'Manager' ? 'All employee sessions' : 'Your full check-in and check-out history'}
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadHistory} disabled={historyLoading}>
            <Download className="w-3.5 h-3.5" />
            Download Excel
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Date', 'Employee', 'Employee ID', 'Check-In', 'Check-Out', 'Working Hours', 'Sessions', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {historyLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Loading attendance history...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No attendance history found.
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono">{formatDate(record.date)}</td>
                    <td className="px-4 py-3 text-xs font-medium">{record.employee?.name || '—'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{record.employee?.employeeId || '—'}</td>
                    <td className="px-4 py-3 text-xs font-mono">{formatTime(record.checkIn)}</td>
                    <td className="px-4 py-3 text-xs font-mono">{formatTime(record.checkOut)}</td>
                    <td className="px-4 py-3 text-xs font-mono">{typeof record.workingHours === 'number' ? `${record.workingHours.toFixed(2)}h` : '—'}</td>
                    <td className="px-4 py-3 text-xs font-mono">{record.sessions?.length ?? 0}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("text-[10px]", statusConfig[record.status].className)}>
                        {statusConfig[record.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1.5"
                        onClick={() => setSelectedAttendance(record)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Session History
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                {['Employee', 'Department', 'Latest Check-In', 'Latest Check-Out', 'Working Hours', 'Sessions', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {attendance.map((a) => (
                <tr key={a._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                          {a.employee?.name}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{a.employee?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">—</td>
                  <td className="px-4 py-3 text-xs font-mono">{formatTime(a.checkIn)}</td>
                  <td className="px-4 py-3 text-xs font-mono">{formatTime(a.checkOut)}</td>
                  <td className="px-4 py-3 text-xs font-mono">{a.workingHours ? `${a.workingHours}h` : '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono">{a.sessions?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={cn("text-[10px]", statusConfig[a.status].className)}>
                      {statusConfig[a.status].label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1.5"
                      onClick={() => setSelectedAttendance(a)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Session History
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedAttendance} onOpenChange={(open) => { if (!open) setSelectedAttendance(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Sora, sans-serif' }}>
              Session History - {selectedAttendance?.employee?.name || 'Employee'}
            </DialogTitle>
          </DialogHeader>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['#', 'Check-In', 'Check-Out', 'Duration'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(selectedAttendance?.sessions ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No session data found.
                    </td>
                  </tr>
                ) : (
                  (selectedAttendance?.sessions ?? []).map((session, index) => (
                    <tr key={`${session.checkIn}-${index}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono">{index + 1}</td>
                      <td className="px-4 py-3 text-xs font-mono">{formatTime(session.checkIn)}</td>
                      <td className="px-4 py-3 text-xs font-mono">{formatTime(session.checkOut)}</td>
                      <td className="px-4 py-3 text-xs font-mono">{formatSessionHours(session)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
