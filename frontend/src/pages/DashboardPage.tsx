import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, CalendarDays, DollarSign, Building2, TrendingUp,
  TrendingDown, Plus, CheckCheck, FileText, UserPlus, ArrowRight,
  Clock, Activity
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

import {
  mockEmployees, mockDepartments, mockLeaveRequests, mockPayroll,
  mockActivities, employeeGrowthData, leaveAnalyticsData,
  payrollTrendData, departmentDistributionData
} from '@/constants/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useSelector } from "react-redux";
import { useEffect, useState } from 'react';
import api from "@/utils/api";
import { useSocket } from '@/context/SocketContext';


const statCards = [
  { title: 'Total Employees', value: '73', change: 4.3, icon: Users, color: 'blue', bg: 'bg-blue-500/10', iconColor: 'text-blue-500' },
  { title: 'Active Employees', value: '68', change: 2.1, icon: UserCheck, color: 'green', bg: 'bg-green-500/10', iconColor: 'text-green-500' },
  { title: 'Pending Leaves', value: '4', change: -12.5, icon: CalendarDays, color: 'amber', bg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
  { title: 'Approved Leaves', value: '3', change: 8.0, icon: CheckCheck, color: 'violet', bg: 'bg-violet-500/10', iconColor: 'text-violet-500' },
  { title: 'Departments', value: '7', change: 0, icon: Building2, color: 'cyan', bg: 'bg-cyan-500/10', iconColor: 'text-cyan-500' },
  { title: 'Monthly Payroll', value: '$421K', change: 3.1, icon: DollarSign, color: 'rose', bg: 'bg-rose-500/10', iconColor: 'text-rose-500' },
];

const activityIcons: Record<string, { icon: React.ElementType; color: string }> = {
  employee_added: { icon: UserPlus, color: 'text-blue-500 bg-blue-500/10' },
  leave_approved: { icon: CheckCheck, color: 'text-green-500 bg-green-500/10' },
  payroll_generated: { icon: DollarSign, color: 'text-violet-500 bg-violet-500/10' },
  department_updated: { icon: Building2, color: 'text-amber-500 bg-amber-500/10' },
  leave_rejected: { icon: CalendarDays, color: 'text-red-500 bg-red-500/10' },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

const fallbackEmployeeGrowthData = [
  { month: 'Jan', employees: 58 },
  { month: 'Feb', employees: 60 },
  { month: 'Mar', employees: 61 },
  { month: 'Apr', employees: 64 },
  { month: 'May', employees: 67 },
  { month: 'Jun', employees: 68 },
  { month: 'Jul', employees: 70 },
  { month: 'Aug', employees: 71 },
  { month: 'Sep', employees: 72 },
  { month: 'Oct', employees: 73 },
  { month: 'Nov', employees: 74 },
  { month: 'Dec', employees: 76 },
];

const fallbackDepartmentDistributionData = [
  { name: 'Engineering', value: 22, fill: 'var(--chart-1)' },
  { name: 'Design', value: 9, fill: 'var(--chart-2)' },
  { name: 'Sales', value: 14, fill: 'var(--chart-3)' },
  { name: 'HR', value: 6, fill: 'var(--chart-4)' },
  { name: 'Finance', value: 8, fill: 'var(--chart-5)' },
  { name: 'Marketing', value: 11, fill: 'var(--chart-6)' },
];

const fallbackPayrollTrendData = [
  { month: 'Jan', amount: 380000 },
  { month: 'Feb', amount: 392500 },
  { month: 'Mar', amount: 401000 },
  { month: 'Apr', amount: 410500 },
  { month: 'May', amount: 417000 },
  { month: 'Jun', amount: 421000 },
  { month: 'Jul', amount: 428000 },
  { month: 'Aug', amount: 434500 },
  { month: 'Sep', amount: 439000 },
  { month: 'Oct', amount: 445000 },
  { month: 'Nov', amount: 452000 },
  { month: 'Dec', amount: 460000 },
];

const fallbackActivities = [
  { id: 'a1', type: 'leave_approved', title: 'Leave approved', description: 'Aman Sharma leave request was approved', timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString() },
  { id: 'a2', type: 'employee_added', title: 'New employee added', description: 'Maria Khan joined the Design team', timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString() },
  { id: 'a3', type: 'payroll_generated', title: 'Payroll generated', description: 'June payroll batch processed successfully', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: 'a4', type: 'leave_rejected', title: 'Leave rejected', description: 'Sana Ali leave request was rejected', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: 'a5', type: 'department_updated', title: 'Department updated', description: 'Marketing department headcount adjusted', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{value: number; name?: string; color?: string}>; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-xs" style={{ color: entry.color }}>{entry.name}: <span className="font-bold">{entry.value?.toLocaleString()}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const user = useSelector((state: any) => state.auth.user);
  const navigate = useNavigate();
  const socket = useSocket();
  const isHR = user?.role === 'Manager';

  const [pendingrequest, setPendingrequest] = useState([]);
  const [leaveAnalytics, setLeaveAnalytics] = useState<Array<{
    employee: string;
    approved: number;
    rejected: number;
    pending: number;
    total: number;
  }>>([]);

  const chartEmployeeGrowthData = employeeGrowthData.length > 0 ? employeeGrowthData : fallbackEmployeeGrowthData;
  const chartDepartmentDistributionData = departmentDistributionData.length > 0 ? departmentDistributionData : fallbackDepartmentDistributionData;
  const chartPayrollTrendData = payrollTrendData.length > 0 ? payrollTrendData : fallbackPayrollTrendData;
  const recentActivities = mockActivities.length > 0 ? mockActivities : fallbackActivities;
  const leaveAnalyticsChartData = leaveAnalytics.length > 0 ? leaveAnalytics : [
    { employee: 'Aman Sharma', approved: 2, rejected: 0, pending: 1, total: 3 },
    { employee: 'Maria Khan', approved: 1, rejected: 1, pending: 0, total: 2 },
    { employee: 'John Carter', approved: 3, rejected: 1, pending: 0, total: 4 },
  ];

  useEffect(() => {
    getPendingLeaves();
    getLeaveAnalytics();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleLeaveListUpdated = () => {
      getPendingLeaves();
      getLeaveAnalytics();
    };

    const handleNotificationCreated = () => {
      getLeaveAnalytics();
    };

    socket.on('leave_list_updated', handleLeaveListUpdated);
    socket.on('notification_created', handleNotificationCreated);

    return () => {
      socket.off('leave_list_updated', handleLeaveListUpdated);
      socket.off('notification_created', handleNotificationCreated);
    };
  }, [socket]);

const getPendingLeaves = async () => {
  try {
    const res = await api.get("/leave/latest-pending");

    console.log(res.data); 

    if (res.data.success) {
      setPendingrequest(res.data.leaves);
    }
  } catch (error) {
    console.log(error);
  }
};

const getLeaveAnalytics = async () => {
  if (!user?.id) return;

  try {
    const endpoint = isHR ? '/leave/all' : `/leave/my/${user.id}`;
    const res = await api.get(endpoint);
    const leaves = res.data.leaves ?? [];

    const grouped = leaves.reduce((acc: Record<string, {
      employee: string;
      approved: number;
      rejected: number;
      pending: number;
      total: number;
    }>, leave: any) => {
      const employeeName = isHR
        ? (leave.employee?.name || leave.employee?.employeeId || 'Unknown employee')
        : `${user.firstName ?? 'My'} ${user.lastName ?? 'Leaves'}`.trim();

      if (!acc[employeeName]) {
        acc[employeeName] = {
          employee: employeeName,
          approved: 0,
          rejected: 0,
          pending: 0,
          total: 0,
        };
      }

      if (leave.status === 'approved') acc[employeeName].approved += 1;
      else if (leave.status === 'rejected') acc[employeeName].rejected += 1;
      else acc[employeeName].pending += 1;

      acc[employeeName].total += 1;
      return acc;
    }, {});

    const chartData = Object.values(grouped)
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    setLeaveAnalytics(chartData);
  } catch (error) {
    console.log(error);
    setLeaveAnalytics([]);
  }
};


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>
            Good morning, {user?.firstName}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {isHR && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => navigate('/employees/add')} className="gap-1.5 h-8 text-xs">
              <UserPlus className="w-3.5 h-3.5" />Add Employee
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/payroll')} className="gap-1.5 h-8 text-xs">
              <DollarSign className="w-3.5 h-3.5" />Payroll
            </Button>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.filter(card => isHR || !['Departments', 'Monthly Payroll'].includes(card.title)).map((card) => {
          const Icon = card.icon;
          const up = card.change >= 0;
          return (
            <div key={card.title} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", card.bg)}>
                  <Icon className={cn("w-4.5 h-4.5", card.iconColor)} />
                </div>
                {card.change !== 0 && (
                  <div className={cn("flex items-center gap-0.5 text-[10px] font-semibold", up ? "text-green-500" : "text-red-500")}>
                    {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(card.change)}%
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{card.title}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Employee Growth */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Employee Growth</h3>
              <p className="text-xs text-muted-foreground">Headcount trend 2025</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">+26% YTD</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartEmployeeGrowthData}>
              <defs>
                <linearGradient id="empGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="employees" name="Employees" stroke="var(--chart-1)" fill="url(#empGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Dept Distribution */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Dept Distribution</h3>
            <p className="text-xs text-muted-foreground">By headcount</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={chartDepartmentDistributionData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {chartDepartmentDistributionData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v} employees`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
            {chartDepartmentDistributionData.slice(0, 4).map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.fill }} />
                <span className="truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Leave Analytics */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Leave Analytics</h3>
              <p className="text-xs text-muted-foreground">Leave requests by employee</p>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate('/leave/approvals')}>
              View all <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={leaveAnalyticsChartData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="employee" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" interval={0} />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="approved" name="Approved" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="rejected" name="Rejected" fill="var(--chart-5)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="var(--chart-4)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payroll Trend */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Payroll Trend</h3>
              <p className="text-xs text-muted-foreground">Monthly disbursements 2025</p>
            </div>
            <Badge variant="secondary" className="text-[10px]">+5.8% YTD</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartPayrollTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={v => `$${Math.round(v / 1000)}K`} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`]} content={<CustomTooltip />} />
              <Line type="monotone" dataKey="amount" name="Payroll" stroke="var(--chart-3)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--chart-3)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
            </div>
          </div>
          <div className="space-y-3">
            {recentActivities.slice(0, 5).map((a) => {
              const { icon: Icon, color } = activityIcons[a.type] || activityIcons.employee_added;
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", color.split(' ')[1])}>
                    <Icon className={cn("w-3.5 h-3.5", color.split(' ')[0])} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{a.description}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{formatTime(a.timestamp)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Leave Requests (HR) / Quick Actions (Employee) */}
        {isHR ? (
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Pending Approvals</h3>
                <p className="text-xs text-muted-foreground">{pendingrequest.length} requests awaiting review</p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate('/leave/approvals')}>
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-2.5">
              {pendingrequest.slice(0, 4).map(leave => (
                <div key={leave._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/80 transition-all">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                     {leave.employee?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">  {leave.employee?.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">
  {leave.leaveType} · {leave.totalDays}d ·{" "}
  {new Date(leave.startDate).toLocaleDateString()}
</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">Pending</Badge>
                </div>
              ))}
              {pendingrequest.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">All caught up!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Apply Leave', icon: CalendarDays, path: '/leave/request', color: 'blue' },
                  { label: 'View Payslip', icon: FileText, path: '/payroll/payslip/p1', color: 'green' },
                  { label: 'Leave History', icon: Clock, path: '/leave/history', color: 'amber' },
                  { label: 'Attendance', icon: CheckCheck, path: '/attendance', color: 'violet' },
                ].map(a => {
                  const Icon = a.icon;
                  return (
                    <button key={a.path} onClick={() => navigate(a.path)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-muted/30 hover:bg-accent hover:border-primary/30 transition-all text-center group">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        a.color === 'blue' ? 'bg-blue-500/10 group-hover:bg-blue-500/20 text-blue-500' :
                        a.color === 'green' ? 'bg-green-500/10 group-hover:bg-green-500/20 text-green-500' :
                        a.color === 'amber' ? 'bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-500' :
                        'bg-violet-500/10 group-hover:bg-violet-500/20 text-violet-500')}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Leave Balance</h3>
              <div className="space-y-3">
                {[
                  { type: 'Annual Leave', total: 12, used: 3, color: 'blue' },
                  { type: 'Sick Leave', total: 10, used: 1, color: 'green' },
                  { type: 'Casual Leave', total: 5, used: 2, color: 'amber' },
                ].map(l => (
                  <div key={l.type} className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-medium text-muted-foreground">{l.type}</span>
                      <span className="font-bold">{l.total - l.used} / {l.total} days</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-1000", 
                        l.color === 'blue' ? 'bg-blue-500' : l.color === 'green' ? 'bg-green-500' : 'bg-amber-500')} 
                        style={{ width: `${((l.total - l.used) / l.total) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
