import { useState } from 'react';
import { 
  Download, 
  Eye, 
  Link2, 
  MoreHorizontal,
  ExternalLink,
  Copy,
  Check,
  Briefcase
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentActionsProps {
  documentId: string;
  filename: string;
  filePath?: string;
  hash: string;
  caseId?: string;
  onCaseLinked?: (caseId: string) => void;
}

export function DocumentActions({ 
  documentId, 
  filename, 
  filePath, 
  hash,
  caseId,
  onCaseLinked 
}: DocumentActionsProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(caseId || '');
  const [isLinking, setIsLinking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    if (!filePath) {
      toast.error('File not available for download');
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('document-vault')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Download started');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download file');
    }
  };

  const handleView = async () => {
    if (!filePath) {
      toast.error('File not available for preview');
      return;
    }

    const { data } = supabase.storage
      .from('document-vault')
      .getPublicUrl(filePath);

    window.open(data.publicUrl, '_blank');
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Hash copied to clipboard');
  };

  const handleLinkCase = async () => {
    if (!selectedCaseId.trim()) {
      toast.error('Please enter a case ID');
      return;
    }

    setIsLinking(true);
    try {
      const { error } = await supabase
        .from('vault_documents')
        .update({ case_id: selectedCaseId.trim() })
        .eq('id', documentId);

      if (error) throw error;

      toast.success(`Linked to case ${selectedCaseId}`);
      onCaseLinked?.(selectedCaseId);
      setLinkDialogOpen(false);
    } catch (err) {
      console.error('Link error:', err);
      toast.error('Failed to link to case');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleView} disabled={!filePath}>
            <Eye className="w-4 h-4 mr-2" />
            View Document
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload} disabled={!filePath}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyHash}>
            {copied ? (
              <Check className="w-4 h-4 mr-2 text-accent" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            Copy Hash
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setLinkDialogOpen(true)}>
            <Link2 className="w-4 h-4 mr-2" />
            {caseId ? 'Change Case Link' : 'Link to Case'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Link to Case Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Link to Case
            </DialogTitle>
            <DialogDescription>
              Associate this document with an investigation case.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-secondary/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Document</p>
              <p className="text-sm font-medium truncate">{filename}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseId">Case ID</Label>
              <Input
                id="caseId"
                placeholder="e.g., CASE-2026-4829"
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
              />
            </div>

            {/* Suggested Cases */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Suggested Cases</p>
              <div className="flex flex-wrap gap-2">
                {['CASE-2026-4829', 'CASE-2026-4830', 'CASE-2026-4831'].map(id => (
                  <button
                    key={id}
                    onClick={() => setSelectedCaseId(id)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      selectedCaseId === id 
                        ? 'bg-accent text-accent-foreground border-accent' 
                        : 'border-border hover:bg-secondary'
                    }`}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLinkCase} disabled={isLinking}>
              {isLinking ? 'Linking...' : 'Link Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
