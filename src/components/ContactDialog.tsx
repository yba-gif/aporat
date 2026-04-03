import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2 } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '', email: '', organization: '', role: '', message: '',
    requestPilot: false, requestSecurityBrief: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      analytics.trackFormSubmit('contact', formData.requestPilot);
      const { error } = await supabase.from('contact_submissions').insert({
        name: formData.name.trim(), email: formData.email.trim(),
        organization: formData.organization.trim(), role: formData.role.trim(),
        message: formData.message.trim() || null,
        request_pilot: formData.requestPilot, request_security_brief: formData.requestSecurityBrief,
      });
      if (error) throw error;
      setIsSubmitted(true);
      toast({ title: "Request submitted", description: "We'll be in touch within 48 hours." });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (v: boolean) => {
    onOpenChange(v);
    if (!v) {
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', email: '', organization: '', role: '', message: '', requestPilot: false, requestSecurityBrief: false });
      }, 300);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 border-border bg-background overflow-hidden">
        <div className="relative">
          <div className="absolute -top-px -left-px w-4 h-4 border-t border-l border-accent" />
          <div className="absolute -top-px -right-px w-4 h-4 border-t border-r border-accent" />
          <div className="absolute -bottom-px -left-px w-4 h-4 border-b border-l border-accent" />
          <div className="absolute -bottom-px -right-px w-4 h-4 border-b border-r border-accent" />

          <div className="p-6 md:p-8">
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 border border-accent/30 animate-pulse" />
                  <div className="absolute inset-2 border border-accent flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <DialogTitle className="text-headline mb-4">Request received.</DialogTitle>
                <p className="text-body mb-6">Our team will respond within 48 hours.</p>
                <Button variant="outline" onClick={() => handleClose(false)}>Close</Button>
              </div>
            ) : (
              <>
                <DialogTitle className="text-lg font-semibold mb-1">Request a briefing</DialogTitle>
                <p className="text-sm text-muted-foreground mb-6">Classified or unclassified.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="d-name" className="text-label mb-2 block font-mono text-xs">NAME <span className="text-accent">*</span></label>
                      <Input id="d-name" name="name" value={formData.name} onChange={handleInputChange} required maxLength={100} className="bg-background border-border focus:border-accent focus:ring-accent font-mono text-sm" />
                    </div>
                    <div>
                      <label htmlFor="d-email" className="text-label mb-2 block font-mono text-xs">EMAIL <span className="text-accent">*</span></label>
                      <Input id="d-email" name="email" type="email" value={formData.email} onChange={handleInputChange} required maxLength={255} className="bg-background border-border focus:border-accent focus:ring-accent font-mono text-sm" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="d-org" className="text-label mb-2 block font-mono text-xs">ORGANIZATION <span className="text-accent">*</span></label>
                      <Input id="d-org" name="organization" value={formData.organization} onChange={handleInputChange} required maxLength={100} className="bg-background border-border focus:border-accent focus:ring-accent font-mono text-sm" />
                    </div>
                    <div>
                      <label htmlFor="d-role" className="text-label mb-2 block font-mono text-xs">ROLE <span className="text-accent">*</span></label>
                      <Input id="d-role" name="role" value={formData.role} onChange={handleInputChange} required maxLength={100} className="bg-background border-border focus:border-accent focus:ring-accent font-mono text-sm" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="d-msg" className="text-label mb-2 block font-mono text-xs">MESSAGE</label>
                    <Textarea id="d-msg" name="message" value={formData.message} onChange={handleInputChange} rows={3} maxLength={1000} placeholder="Describe your operational requirements..." className="bg-background border-border focus:border-accent focus:ring-accent resize-none font-mono text-sm" />
                  </div>

                  <div className="space-y-3 p-3 border border-border/50 bg-background/50">
                    <p className="text-xs font-mono text-muted-foreground mb-2">OPTIONS</p>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="d-pilot" checked={formData.requestPilot} onCheckedChange={(c) => setFormData((p) => ({ ...p, requestPilot: c as boolean }))} className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent" />
                      <label htmlFor="d-pilot" className="text-sm text-muted-foreground cursor-pointer font-mono">Request pilot access</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox id="d-sec" checked={formData.requestSecurityBrief} onCheckedChange={(c) => setFormData((p) => ({ ...p, requestSecurityBrief: c as boolean }))} className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent" />
                      <label htmlFor="d-sec" className="text-sm text-muted-foreground cursor-pointer font-mono">Request security brief</label>
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-foreground text-background hover:bg-foreground/90 font-mono uppercase tracking-wider">
                    {isSubmitting ? <span className="flex items-center gap-2"><span className="w-2 h-2 bg-background rounded-full animate-pulse" />Processing...</span> : 'Submit request'}
                  </Button>
                  <p className="text-[10px] font-mono text-muted-foreground text-center">Data encrypted in transit. Stored securely.</p>
                </form>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
