import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, CalendarDays, DollarSign,
  Clock, BarChart3, Bell, Settings, LogOut, ChevronLeft,
  ChevronRight, Menu, Search, Sun, Moon, ChevronDown, Briefcase,
  UserCheck, FileText, X, TrendingUp, FolderOpen, CalendarRange
} from 'lucide-react';


import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slice/authslice";



const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['Employee', 'Manager'] },
  { label: 'Employees', icon: Users, path: '/employees', roles: ['Manager'] },
  { label: 'Departments', icon: Building2, path: '/departments', roles: ['Manager'] },
  {
    label: 'Leave Management', icon: CalendarDays, path: '/leave', roles: ['Employee', 'Manager'],
    children: [
      { label: 'Apply Leave', path: '/leave/request', roles: ['Employee'] },
      { label: 'Leave History', path: '/leave/history', roles: ['Employee'] },
      { label: 'Approvals', path: '/leave/approvals', roles: ['Manager'] },
    ]
  },
  { label: 'Payroll', icon: DollarSign, path: '/payroll', roles: ['Manager'] },
  { label: 'My Payslip', icon: FileText, path: '/payroll/payslip/p1', roles: ['Employee'] },
  { label: 'Attendance', icon: Clock, path: '/attendance', roles: ['Employee', 'Manager'] },
  { label: 'Document Center', icon: FolderOpen, path: '/documents', roles: ['Employee', 'Manager'] },
  { label: 'Company Calendar', icon: CalendarRange, path: '/calendar', roles: ['Employee', 'Manager'] },
  { label: 'Reports', icon: BarChart3, path: '/reports', roles: ['Manager'] },
  { label: 'Notifications', icon: Bell, path: '/notifications', roles: ['Employee', 'Manager'] },
  { label: 'Settings', icon: Settings, path: '/settings', roles: ['Employee', 'Manager'] },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {

  const location = useLocation();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState<string[]>(['/leave']);
   const user = useSelector((state: any) => state.auth.user);


const dispatch = useDispatch();

const logout = () => {
  dispatch(logoutUser());
  navigate("/login");
};

  const filteredNav = navItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  );

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const toggleGroup = (path: string) => {
    setOpenGroups(prev => prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]);
  };
 

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-40 transition-all duration-300 ease-in-out",
        collapsed ? "w-[64px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center border-b border-sidebar-border", collapsed ? "p-3 justify-center" : "px-5 py-4")}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-sidebar-foreground truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
              NexaHR
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.filter(c => user?.role && c.roles.includes(user.role)).length > 0;
          const active = isActive(item.path);
          const groupOpen = openGroups.includes(item.path);

          if (hasChildren && !collapsed) {
            const visibleChildren = item.children!.filter(c => user?.role && c.roles.includes(user.role));
            return (
              <div key={item.path}>
                <button
                  onClick={() => toggleGroup(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                    active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", groupOpen && "rotate-180")} />
                </button>
                {groupOpen && (
                  <div className="ml-7 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
                    {visibleChildren.map(child => (
                      <NavLink key={child.path} to={child.path}
                        className={({ isActive }) => cn(
                          "block px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                          isActive ? "text-primary bg-primary/10" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        )}
                      >{child.label}</NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          if (collapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate(hasChildren ? (item.children![0].path) : item.path)}
                    className={cn(
                      "w-full flex items-center justify-center p-2 rounded-lg transition-all",
                      active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <NavLink key={item.path} to={item.path}
              className={({ isActive: a }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                (a || active) ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User + Logout */}
      {!collapsed && user && (
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-sidebar-foreground/60 truncate capitalize">{user.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 h-7" onClick={logout}>
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </Button>
        </div>
      )}
      {collapsed && (
        <div className="border-t border-sidebar-border p-2">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button onClick={logout} className="w-full flex justify-center p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign out</TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center hover:bg-accent transition-all shadow-sm"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}

function TopNavbar({ sidebarCollapsed, onMenuClick }: { sidebarCollapsed: boolean; onMenuClick: () => void }) {
  // const { user, switchRole, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

const user = useSelector((state: any) => state.auth.user);

const logout = () => {
  dispatch(logoutUser());
  navigate("/login");
};
  const unreadCount = 0;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const getBreadcrumb = () => {
    const path = location.pathname;
    const map: Record<string, string> = {
      '/dashboard': 'Dashboard', '/employees': 'Employees', '/employees/add': 'Add Employee',
      '/departments': 'Departments', '/leave/request': 'Apply Leave', '/leave/history': 'Leave History',
      '/leave/approvals': 'Leave Approvals', '/payroll': 'Payroll', '/attendance': 'Attendance',
      '/reports': 'Reports', '/notifications': 'Notifications', '/settings': 'Settings',
      '/documents': 'Document Center', '/calendar': 'Company Calendar',
    };
    if (path.startsWith('/employees/') && path !== '/employees/add') return 'Employee Details';
    if (path.startsWith('/departments/')) return 'Department Details';
    if (path.startsWith('/payroll/payslip/')) return 'Payslip';
    return map[path] || 'NexaHR';
  };

  return (
    <header className={cn(
      "fixed top-0 right-0 h-14 bg-background/95 backdrop-blur-sm border-b border-border z-30 flex items-center gap-4 px-4 transition-all duration-300",
      sidebarCollapsed ? "left-[64px]" : "left-[240px]"
    )}>
      <button className="md:hidden p-1.5 rounded-md hover:bg-accent" onClick={onMenuClick}>
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{getBreadcrumb()}</span>
      </div>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-xs ml-4">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input className="pl-8 h-8 text-sm bg-muted/50 border-0 focus-visible:ring-1" placeholder="Search..." />
        </div>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Theme toggle */}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsDark(!isDark)}>
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-8 w-8 relative" onClick={() => navigate('/notifications')}>
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>

        {/* User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-accent transition-all ml-1">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-bold">
                    {user.name}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold leading-none">{user.firstName}</p>
                  <p className="text-[10px] text-muted-foreground capitalize leading-none mt-0.5">{user.role}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />
      <TopNavbar sidebarCollapsed={sidebarCollapsed} onMenuClick={() => setSidebarCollapsed(p => !p)} />
      <main className={cn(
        "transition-all duration-300 pt-14 min-h-screen",
        sidebarCollapsed ? "ml-[64px]" : "ml-[240px]"
      )}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
