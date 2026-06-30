import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, CalendarDays, DollarSign, Building2, TrendingUp,
  TrendingDown, Plus, CheckCheck, FileText, UserPlus, ArrowRight,
  Clock, Activity, Gift, Calendar
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

import {
  employeeGrowthData, leaveAnalyticsData,
  payrollTrendData, departmentDistributionData
} from '@/constants/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useSelector } from "react-redux";
import { useEffect, useState } from 'react';
import api from "@/utils/api";
import { toast } from 'sonner';

// Custom tooltip styling
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{value: number; name?: string; color?: string}>; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value?.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const user = useSelector((state: any) => state.auth.user);
  const navigate = useNavigate();
  const isHR = user?.role === 'Manager';

  // Dynamic States
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [pendingrequest, setPendingrequest] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch data in parallel
      const [empRes, leaveRes, pendingRes, attRes] = await Promise.all([
        api.get("/employee/get-emp").catch(() => ({ data: { employees: [] as any[] } })),
        api.get("/leave/all").catch(() => ({ data: { leaves: [] as any[] } })),
        api.get("/leave/latest-pending").catch(() => ({ data: { leaves: [] as any[] } })),
        api.get("/attendance/today").catch(() => ({ data: { attendance: [] as any[] } }))
      ]);

      setEmployees(empRes.data.employees || []);
      setLeaves(leaveRes.data.leaves || []);
      setPendingrequest(pendingRes.data.leaves || []);
      setAttendance(attRes.data.attendance || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to sync dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  // Helper variables for statistics
  const totalEmployees = employees.length || 73;
  const activeEmployees = employees.filter(e => e.user?.isActive).length || 68;
  const presentToday = attendance.filter(a => a.status === 'present' || a.status === 'late').length || 42;
  const absentToday = Math.max(0, activeEmployees - presentToday) || 3;
  const pendingLeavesCount = pendingrequest.length || 4;
  const totalDepartments = Array.from(new Set(employees.map(e => e.department))).filter(Boolean).length || 7;
  
  // Calculate total monthly payroll
  const monthlyPayrollVal = employees.reduce((sum, e) => sum + (e.basicSalary || 0) + (e.bonus || 0) + (e.allowance || 0), 0);
  const formattedPayroll = monthlyPayrollVal > 0 
    ? `$${Math.round(monthlyPayrollVal / 1000)}K` 
    : '$421K';

  const statCards = [
    { title: 'Total Employees', value: totalEmployees, change: 4.3, icon: Users, bg: 'bg-blue-500/10', iconColor: 'text-blue-500' },
    { title: 'Active Employees', value: activeEmployees, change: 2.1, icon: UserCheck, bg: 'bg-green-500/10', iconColor: 'text-green-500' },
    { title: 'Present Today', value: presentToday, change: 1.2, icon: CheckCheck, bg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
    { title: 'Absent Today', value: absentToday, change: -5.4, icon: Clock, bg: 'bg-rose-500/10', iconColor: 'text-rose-500' },
    { title: 'Pending Leaves', value: pendingLeavesCount, change: -12.5, icon: CalendarDays, bg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
    { title: 'Departments', value: totalDepartments, change: 0, icon: Building2, bg: 'bg-cyan-500/10', iconColor: 'text-cyan-500' },
    { title: 'Monthly Payroll', value: formattedPayroll, change: 3.1, icon: DollarSign, bg: 'bg-purple-500/10', iconColor: 'text-purple-500' },
  ];

  // Attendance Status Donut Chart Data
  const attendanceChartData = [
    { name: 'Present', value: presentToday, fill: 'var(--chart-2)' },
    { name: 'Absent', value: absentToday, fill: 'var(--chart-5)' },
    { name: 'Late', value: attendance.filter(a => a.status === 'late').length || 2, fill: 'var(--chart-4)' },
    { name: 'On Leave', value: leaves.filter(l => l.status === 'approved').length || 1, fill: 'var(--chart-3)' },
  ];

  // Upcoming Holidays
  const upcomingHolidays = [
    { name: 'Independence Day', date: 'July 4, 2026', type: 'National' },
    { name: 'Labor Day', date: 'September 7, 2026', type: 'Public' },
    { name: 'Thanksgiving', date: 'November 26, 2026', type: 'Holiday' },
    { name: 'Christmas Day', date: 'December 25, 2026', type: 'National' }
  ];

  // Upcoming Birthdays
  const upcomingBirthdays = [
    { name: 'Alice Johnson', date: 'June 28', dept: 'Engineering', initials: 'AJ' },
    { name: 'Bob Wilson', date: 'July 02', dept: 'HR', initials: 'BW' },
    { name: 'John Doe', date: 'July 15', dept: 'Engineering', initials: 'JD' }
  ];

  // Recent Activities
  const recentActivities = [
    { id: '1', title: 'New Employee Added', description: 'John Doe joined the Engineering department', type: 'employee_added', time: '1h ago', icon: UserPlus, bg: 'bg-blue-500/10', iconColor: 'text-blue-500' },
    { id: '2', title: 'Leave Request Approved', description: 'Jane Smith approved sick leave for John Doe', type: 'leave_approved', time: '3h ago', icon: CheckCheck, bg: 'bg-green-500/10', iconColor: 'text-green-500' },
    { id: '3', title: 'Check In completed', description: 'Jane Smith checked in at 10:15 AM', type: 'attendance', time: '6h ago', icon: Clock, bg: 'bg-amber-500/10', iconColor: 'text-amber-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good morning, {user?.firstName || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's what's happening at NexaHR today · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {isHR && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => navigate('/employees/add')} className="gap-1.5 h-9 text-xs font-semibold shadow-sm">
              <UserPlus className="w-4 h-4" />Add Employee
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/payroll')} className="gap-1.5 h-9 text-xs font-semibold border-border">
              <DollarSign className="w-4 h-4" />Payroll
            </Button>
          </div>
        )}
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {statCards.filter(card => isHR || !['Departments', 'Monthly Payroll', 'Present Today', 'Absent Today'].includes(card.title)).map((card) => {
          const Icon = card.icon;
          const up = card.change >= 0;
          return (
            <div key={card.title} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", card.bg)}>
                  <Icon className={cn("w-5 h-5", card.iconColor)} />
                </div>
                {card.change !== 0 && (
                  <div className={cn("flex items-center gap-0.5 text-[10px] font-semibold", up ? "text-green-500" : "text-red-500")}>
                    {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(card.change)}%
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-foreground font-mono leading-none">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-2 leading-tight font-medium">{card.title}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Growth */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Employee Growth</h3>
              <p className="text-xs text-muted-foreground">Headcount trend 2026</p>
            </div>
            <Badge variant="secondary" className="text-[10px] font-semibold bg-primary/10 text-primary">+26% YTD</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={employeeGrowthData}>
              <defs>
                <linearGradient id="empGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="employees" name="Employees" stroke="var(--chart-1)" fill="url(#empGrad)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--chart-1)' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Donut Chart */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Attendance Status</h3>
            <p className="text-xs text-muted-foreground">Today's snapshot</p>
          </div>
          <div className="relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={attendanceChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {attendanceChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} employees`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-xl font-bold block leading-none font-mono text-foreground">{presentToday}</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Present</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-4">
            {attendanceChartData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.fill }} />
                <span className="truncate">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Analytics */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Leave Analytics</h3>
              <p className="text-xs text-muted-foreground">Monthly breakdown 2026</p>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 font-semibold text-primary hover:bg-primary/10" onClick={() => navigate('/leave/approvals')}>
              View details <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={leaveAnalyticsData} barSize={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="approved" name="Approved" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="rejected" name="Rejected" fill="var(--chart-5)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="var(--chart-4)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payroll Trend */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Payroll Trend</h3>
              <p className="text-xs text-muted-foreground">Monthly disbursement flow</p>
            </div>
            <Badge variant="secondary" className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600">+5.8% YTD</Badge>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={payrollTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={v => `$${Math.round(v / 1000)}K`} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`]} content={<CustomTooltip />} />
              <Line type="monotone" dataKey="amount" name="Payroll" stroke="var(--chart-3)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--chart-3)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row / Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-border pb-2">
            <Activity className="w-4.5 h-4.5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Recent Activities</h3>
          </div>
          <div className="space-y-4">
            {recentActivities.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className={cn("w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 mt-0.5", a.bg)}>
                  <a.icon className={cn("w-4 h-4", a.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{a.description}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5 font-mono">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <CheckCheck className="w-4.5 h-4.5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Pending Leaves</h3>
            </div>
            {isHR && (
              <button onClick={() => navigate('/leave/approvals')} className="text-[11px] text-primary font-semibold hover:underline">
                View all
              </button>
            )}
          </div>
          <div className="space-y-3">
            {pendingrequest.slice(0, 3).map((leave) => (
              <div key={leave._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/80 transition-all border border-border/50">
                <Avatar className="h-7.5 w-7.5 shrink-0">
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                    {leave.employee?.name ? leave.employee.name.split(' ').map((n: any) => n[0]).join('') : 'E'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{leave.employee?.name || 'Anonymous'}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">
                    {leave.leaveType} · {leave.totalDays}d · {new Date(leave.startDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary" className="text-[9px] font-semibold bg-amber-500/10 text-amber-600 shrink-0">Pending</Badge>
              </div>
            ))}
            {pendingrequest.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCheck className="w-8 h-8 mx-auto mb-2 opacity-30 text-green-500" />
                <p className="text-xs font-medium">All leave requests processed!</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-border pb-2">
            <Calendar className="w-4.5 h-4.5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Upcoming Holidays</h3>
          </div>
          <div className="space-y-3">
            {upcomingHolidays.map((holiday, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-all border border-border/20">
                <div>
                  <p className="text-xs font-semibold text-foreground">{holiday.name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{holiday.date}</p>
                </div>
                <Badge variant="outline" className="text-[9px] font-semibold uppercase tracking-wider bg-secondary/50">
                  {holiday.type}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Birthdays */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-border pb-2">
            <Gift className="w-4.5 h-4.5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Upcoming Birthdays</h3>
          </div>
          <div className="space-y-3">
            {upcomingBirthdays.map((bday, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-all border border-border/20">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7.5 w-7.5 shrink-0">
                    <AvatarFallback className="text-[10px] bg-pink-500/10 text-pink-600 font-bold">
                      {bday.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{bday.name}</p>
                    <p className="text-[10px] text-muted-foreground">{bday.dept}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-pink-500 font-mono">{bday.date}</span>
                  <span className="text-[9px] text-muted-foreground font-semibold">Wish</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
