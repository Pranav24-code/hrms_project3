import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Download, MoreHorizontal, Eye, Edit, Trash2,
  ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Filter, AlertTriangle, Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from "@/utils/api";

const statusConfig = {
  active: { label: 'Active', className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
  inactive: { label: 'Inactive', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

export default function EmployeeListPage() {
  const navigate = useNavigate();
  
  // Filtering states
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [desigFilter, setDesigFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Sorting states
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination states
  const [page, setPage] = useState(1);
  const perPage = 8;
  
  // Data states
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Delete Dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/employee/get-emp");
      setEmployees(res.data.employees || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleDeleteClick = (emp: any) => {
    setEmployeeToDelete(emp);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      setIsDeleting(true);
      // Simulating database delete / demo endpoint call if supported
      // Usually would be api.delete(`/employee/${employeeToDelete._id}`)
      
      // Update local storage db directly for offline consistency
      const localEmps = JSON.parse(localStorage.getItem('hrms_employees') || '[]');
      const filteredEmps = localEmps.filter((e: any) => e._id !== employeeToDelete._id && e.id !== employeeToDelete.id);
      localStorage.setItem('hrms_employees', JSON.stringify(filteredEmps));
      
      toast.success(`${employeeToDelete.firstName} ${employeeToDelete.lastName} removed successfully`);
      setDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
      fetchEmployees();
    } catch (error) {
      toast.error("Failed to delete employee");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter logic
  const filtered = employees.filter((e) => {
    const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
    const matchSearch =
      fullName.includes(search.toLowerCase()) ||
      (e.user?.email || e.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.employeeId || '').toLowerCase().includes(search.toLowerCase());

    const matchDept = deptFilter === "all" || e.department === deptFilter;
    const matchDesig = desigFilter === "all" || e.designation === desigFilter;

    const isActive = e.user?.isActive !== undefined ? e.user.isActive : e.status === 'active';
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && isActive) ||
      (statusFilter === "inactive" && !isActive);

    return matchSearch && matchDept && matchDesig && matchStatus;
  });

  // Sorting logic
  const sorted = [...filtered].sort((a, b) => {
    let valA = '';
    let valB = '';

    if (sortField === 'name') {
      valA = `${a.firstName} ${a.lastName}`.toLowerCase();
      valB = `${b.firstName} ${b.lastName}`.toLowerCase();
    } else if (sortField === 'id') {
      valA = (a.employeeId || '').toLowerCase();
      valB = (b.employeeId || '').toLowerCase();
    } else if (sortField === 'department') {
      valA = (a.department || '').toLowerCase();
      valB = (b.department || '').toLowerCase();
    } else if (sortField === 'designation') {
      valA = (a.designation || '').toLowerCase();
      valB = (b.designation || '').toLowerCase();
    } else if (sortField === 'joiningDate') {
      valA = a.joiningDate || '';
      valB = b.joiningDate || '';
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const paginated = sorted.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  // Dynamic filter dropdown options
  const departments = Array.from(new Set(employees.map(e => e.department))).filter(Boolean);
  const designations = Array.from(new Set(employees.map(e => e.designation))).filter(Boolean);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginated.map(e => e._id));
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
    const localEmps = JSON.parse(localStorage.getItem('hrms_employees') || '[]');
    const filteredEmps = localEmps.filter((e: any) => !selectedIds.includes(e._id));
    localStorage.setItem('hrms_employees', JSON.stringify(filteredEmps));
    
    toast.success(`Deleted ${selectedIds.length} employees successfully`);
    setSelectedIds([]);
    fetchEmployees();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Employees</h1>
          <p className="text-sm text-muted-foreground">
            {employees.length} total employees across {departments.length} departments
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" className="h-9 gap-1.5 text-xs font-semibold" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4" /> Delete Selected ({selectedIds.length})
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-semibold border-border" onClick={() => {
            toast.info("Exported employee database to CSV (Demo)");
          }}>
            <Download className="w-4 h-4" />Export
          </Button>
          <Button size="sm" className="h-9 gap-1.5 text-xs font-semibold shadow-sm" onClick={() => navigate('/employees/add')}>
            <Plus className="w-4 h-4" />Add Employee
          </Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 h-9 text-xs"
              placeholder="Search by name, email, ID…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Department Filter */}
          <Select value={deptFilter} onValueChange={v => { setDeptFilter(v); setPage(1); }}>
            <SelectTrigger className="h-9 text-xs border-border bg-background"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Designation Filter */}
          <Select value={desigFilter} onValueChange={v => { setDesigFilter(v); setPage(1); }}>
            <SelectTrigger className="h-9 text-xs border-border bg-background"><SelectValue placeholder="Designation" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Designations</SelectItem>
              {designations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="h-9 text-xs border-border bg-background"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
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
                
                {/* Column Headers with Sorting */}
                <th className="px-4 py-3 text-left">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground">
                    Employee
                    {sortField === 'name' ? (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : null}
                  </button>
                </th>
                
                <th className="px-4 py-3 text-left hidden md:table-cell">
                  <button onClick={() => handleSort('department')} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground">
                    Department
                    {sortField === 'department' ? (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : null}
                  </button>
                </th>
                
                <th className="px-4 py-3 text-left hidden lg:table-cell">
                  <button onClick={() => handleSort('designation')} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground">
                    Designation
                    {sortField === 'designation' ? (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : null}
                  </button>
                </th>
                
                <th className="px-4 py-3 text-left hidden xl:table-cell">
                  <button onClick={() => handleSort('joiningDate')} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground">
                    Joined
                    {sortField === 'joiningDate' ? (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : null}
                  </button>
                </th>
                
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4"><div className="w-4 h-4 bg-muted rounded" /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full" />
                        <div className="space-y-1">
                          <div className="w-24 h-3 bg-muted rounded" />
                          <div className="w-16 h-2 bg-muted rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell"><div className="w-16 h-3 bg-muted rounded" /></td>
                    <td className="p-4 hidden lg:table-cell"><div className="w-20 h-3 bg-muted rounded" /></td>
                    <td className="p-4 hidden xl:table-cell"><div className="w-16 h-3 bg-muted rounded" /></td>
                    <td className="p-4"><div className="w-12 h-4 bg-muted rounded-full" /></td>
                    <td className="p-4 text-right"><div className="w-6 h-6 ml-auto bg-muted rounded" /></td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No employees found matching the filters.
                  </td>
                </tr>
              ) : (
                paginated.map((emp) => {
                  const isActive = emp.user?.isActive !== undefined ? emp.user.isActive : emp.status === 'active';
                  return (
                    <tr key={emp._id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-3">
                        <Checkbox 
                          checked={selectedIds.includes(emp._id)} 
                          onCheckedChange={(c) => handleSelectOne(emp._id, c as boolean)} 
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8.5 w-8.5 shrink-0 border border-border">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                              {emp.firstName?.[0] || ''}{emp.lastName?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground text-sm leading-tight">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                              {emp.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs font-medium text-muted-foreground">
                        {emp.department}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                        {emp.designation}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground font-mono">
                        {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-bold uppercase tracking-wider py-0.5",
                            isActive ? statusConfig.active.className : statusConfig.inactive.className
                          )}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => navigate(`/employees/${emp._id || emp.id}`)}>
                              <Eye className="w-4 h-4 mr-2" />View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              toast.info("Edit features are demo-only in this enhancement (Preserving structure)");
                            }}>
                              <Edit className="w-4 h-4 mr-2" />Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteClick(emp)}>
                              <Trash2 className="w-4 h-4 mr-2" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length} employees
            </p>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2.5 text-xs font-semibold border-border" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-3.5 h-3.5" />Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0 text-xs font-semibold" onClick={() => setPage(p)}>
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2.5 text-xs font-semibold border-border" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Next<ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">Confirm Delete Employee</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Are you sure you want to delete <span className="font-semibold text-foreground">{employeeToDelete?.firstName} {employeeToDelete?.lastName}</span>? This action is permanent and will delete their attendance records, payroll, and leave history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" className="h-9 text-xs border-border" disabled={isDeleting} onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="h-9 text-xs font-semibold" disabled={isDeleting} onClick={confirmDelete}>
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
