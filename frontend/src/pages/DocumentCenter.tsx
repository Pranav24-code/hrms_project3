import { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, FileText, Trash2, Download, File, Image, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/utils/api';
import { useSelector } from 'react-redux';

const docTypeColors: Record<string, string> = {
  ID: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  Contract: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  Payslip: 'bg-green-500/10 text-green-600 border-green-500/20',
  Other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

function formatBytes(bytes: number) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentCenter() {
  const user = useSelector((state: any) => state.auth.user);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [docType, setDocType] = useState('Other');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const endpoint = user?.role === 'Manager'
        ? '/documents/all'
        : `/documents/user/${user?.id}`;
      const res = await api.get(endpoint);
      setDocuments(res.data.documents || []);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum allowed size is 5MB.' });
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);
    formData.append('userId', user?.id);

    try {
      setUploading(true);
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded successfully');
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/documents/${id}`);
      toast.success('Document deleted');
      setDocuments(prev => prev.filter(d => d._id !== id));
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Document Center</h1>
        <p className="text-sm text-muted-foreground">Upload and manage important documents securely</p>
      </div>

      {/* Upload Zone */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Upload className="w-4 h-4" />Upload Document</h3>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
              <SelectValue placeholder="Document Type" />
            </SelectTrigger>
            <SelectContent>
              {['ID', 'Contract', 'Payslip', 'Other'].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="h-9 gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading...</> : <><Upload className="w-4 h-4" />Choose File</>}
          </Button>
          <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
            onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); e.target.value = ''; }}
          />
        </div>
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer",
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"
          )}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Drag & drop a file here, or click to browse</p>
          <p className="text-xs text-muted-foreground/60 mt-1">PDF, JPG, PNG · Max 5MB</p>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold">Uploaded Documents ({documents.length})</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['File Name', 'Type', ...(user?.role === 'Manager' ? ['Owner'] : []), 'Size', 'Uploaded', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {documents.map(doc => (
                  <tr key={doc._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {doc.mimeType === 'application/pdf' ? (
                          <FileText className="w-4 h-4 text-red-500 shrink-0" />
                        ) : (
                          <Image className="w-4 h-4 text-blue-500 shrink-0" />
                        )}
                        <span className="text-sm font-medium truncate max-w-[200px]">{doc.fileName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("text-[10px]", docTypeColors[doc.documentType] || docTypeColors.Other)}>
                        {doc.documentType}
                      </Badge>
                    </td>
                    {user?.role === 'Manager' && (
                      <td className="px-4 py-3 text-xs text-muted-foreground">{doc.userId?.name || '—'}</td>
                    )}
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatBytes(doc.fileSize)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => window.open(`http://localhost:5000${doc.fileUrl}`, '_blank')}>
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(doc._id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
