import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { analytics } from '@/lib/analytics';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Calendar, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    message: '',
    requestPilot: false,
    requestSecurityBrief: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      analytics.trackFormSubmit('contact', formData.requestPilot);

      const { error } = await supabase.from('contact_submissions').insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        organization: formData.organization.trim(),
        role: formData.role.trim(),
        message: formData.message.trim() || null,
        request_pilot: formData.requestPilot,
        request_security_brief: formData.requestSecurityBrief,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Request submitted",
        description: "We'll be in touch within 48 hours.",
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Submission failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isSubmitted) {
    return (
      <section id="contact" className="section-padding">
        <div className="container-narrow text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border border-accent/30 animate-pulse" />
            <div className="absolute inset-2 border border-accent flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-accent" />
            </div>
          </div>
          <h2 className="text-headline mb-4">Request received.</h2>
          <p className="text-body mb-6">
            Our team will respond within 48 hours.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="section-padding">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left: Content */}
          <div>
            <p className="text-label mb-4">Contact</p>
            <h2 className="text-headline mb-6">
              Infrastructure built
              <br />
              for what's at stake.
            </h2>
            
            <p className="text-body mb-8 max-w-md">
              Request a briefing. Classified or unclassified.
            </p>

            {/* Alternative Contact */}
            <div className="space-y-4">
              <a
                href="mailto:contact@alpagu.com"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <Mail className="w-4 h-4" />
                <span className="link-underline">contact@alpagu.com</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <Calendar className="w-4 h-4" />
                <span className="link-underline">Schedule a call</span>
              </a>
            </div>
          </div>

          {/* Right: Form */}
          <div className="relative">
            {/* Corner decorations */}
            <div className="absolute -top-px -left-px w-4 h-4 border-t border-l border-accent" />
            <div className="absolute -top-px -right-px w-4 h-4 border-t border-r border-accent" />
            <div className="absolute -bottom-px -left-px w-4 h-4 border-b border-l border-accent" />
            <div className="absolute -bottom-px -right-px w-4 h-4 border-b border-r border-accent" />

            <div className="bg-surface-elevated border border-border p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="text-label mb-2 block font-mono text-xs">
                      NAME <span className="text-accent">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      maxLength={100}
                      className="bg-background border-border focus:border-accent focus:ring-accent font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-label mb-2 block font-mono text-xs">
                      EMAIL <span className="text-accent">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      maxLength={255}
                      className="bg-background border-border focus:border-accent focus:ring-accent font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="organization" className="text-label mb-2 block font-mono text-xs">
                      ORGANIZATION <span className="text-accent">*</span>
                    </label>
                    <Input
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      required
                      maxLength={100}
                      className="bg-background border-border focus:border-accent focus:ring-accent font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="text-label mb-2 block font-mono text-xs">
                      ROLE <span className="text-accent">*</span>
                    </label>
                    <Input
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      maxLength={100}
                      className="bg-background border-border focus:border-accent focus:ring-accent font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="text-label mb-2 block font-mono text-xs">
                    MESSAGE
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={1000}
                    placeholder="Describe your operational requirements..."
                    className="bg-background border-border focus:border-accent focus:ring-accent resize-none font-mono text-sm"
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 p-4 border border-border/50 bg-background/50">
                  <p className="text-xs font-mono text-muted-foreground mb-3">OPTIONS</p>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="requestPilot"
                      checked={formData.requestPilot}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, requestPilot: checked as boolean }))
                      }
                      className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                    <label htmlFor="requestPilot" className="text-sm text-muted-foreground cursor-pointer font-mono">
                      Request pilot access
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="requestSecurityBrief"
                      checked={formData.requestSecurityBrief}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, requestSecurityBrief: checked as boolean }))
                      }
                      className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                    />
                    <label htmlFor="requestSecurityBrief" className="text-sm text-muted-foreground cursor-pointer font-mono">
                      Request security brief
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-foreground text-background hover:bg-foreground/90 font-mono uppercase tracking-wider"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-background rounded-full animate-pulse" />
                      Processing...
                    </span>
                  ) : (
                    'Request a briefing'
                  )}
                </Button>

                <p className="text-[10px] font-mono text-muted-foreground text-center">
                  Data encrypted in transit. Stored securely.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
