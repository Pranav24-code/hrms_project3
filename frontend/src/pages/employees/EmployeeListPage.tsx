import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Download, MoreHorizontal, Eye, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { mockEmployees } from '@/constants/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from "@/utils/api";

const statusConfig = {
  active: { label: 'Active', className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
  inactive: { label: 'Inactive', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  on_leave: { label: 'On Leave', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
};

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const perPage = 8;
  const [employees, setEmployees] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchEmployees();
}, []);

const fetchEmployees = async () => {
  try {
    const res = await api.get("/employee/get-emp");

    setEmployees(res.data.employees);
  } catch (err) {
    console.log(err);
    toast.error("Failed to load employees");
  } finally {
    setLoading(false);
  }
};

const filtered = employees.filter((e) => {
  const matchSearch =
    `${e.firstName} ${e.lastName} ${e.user?.email} ${e.employeeId}`
      .toLowerCase()
      .includes(search.toLowerCase());

  const matchDept =
    deptFilter === "all" || e.department === deptFilter;

  const matchStatus =
    statusFilter === "all" ||
    (statusFilter === "active" && e.user?.isActive) ||
    (statusFilter === "inactive" && !e.user?.isActive);

  return matchSearch && matchDept && matchStatus;
});

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);
  const depts = [...new Set(employees.map((e) => e.department))];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginated.map(e => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkDelete = () => {
    toast.success(`Deleted ${selectedIds.length} employees (demo)`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>Employees</h1>
          <p className="text-sm text-muted-foreground">{employees.length} total employees across {depts.length} departments</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-primary">Bulk Actions ({selectedIds.length})</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBulkDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs"><Download className="w-3.5 h-3.5" />Export</Button>
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => navigate('/employees/add')}><Plus className="w-3.5 h-3.5" />Add Employee</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input className="pl-9 h-8 text-sm" placeholder="Search by name, email, ID…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Select value={deptFilter} onValueChange={v => { setDeptFilter(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {depts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left w-10">
                  <Checkbox 
                    checked={paginated.length > 0 && selectedIds.length === paginated.length} 
                    onCheckedChange={(c) => handleSelectAll(c as boolean)} 
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Designation</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden xl:table-cell">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">No employees found.</td></tr>
              ) : paginated.map((emp) => (
                <tr key={emp._id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3">
                    <Checkbox 
                      checked={selectedIds.includes(emp._id)} 
                      onCheckedChange={(c) => handleSelectOne(emp._id, c as boolean)} 
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">{emp.firstName} {emp.lastName}</p>
                        <p className="text-[11px] text-muted-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{emp.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-muted-foreground">{emp.department}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">{emp.designation}</td>
                  <td className="px-4 py-3 hidden xl:table-cell text-sm text-muted-foreground">{new Date(emp.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td className="px-4 py-3">
                   <Badge
  variant="outline"
  className={cn(
    "text-[10px] font-medium capitalize",
    emp.user?.isActive
      ? statusConfig.active.className
      : statusConfig.inactive.className
  )}
>
  {emp.user?.isActive ? "Active" : "Inactive"}
</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/employees/${emp.id}`)}><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Edit Employee</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => toast.success(`${emp.firstName} removed (demo)`)}>
                          <Trash2 className="w-4 h-4 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length} employees
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="h-7 w-7 p-0 text-xs" onClick={() => setPage(p)}>{p}</Button>
              ))}
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
