import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { analytics } from '@/lib/analytics';
import { Mail, Calendar } from 'lucide-react';

export function Contact() {
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

    // Track form submission
    analytics.trackFormSubmit('contact', formData.requestPilot);

    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
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
          <div className="w-12 h-12 mx-auto mb-6 border border-accent flex items-center justify-center">
            <span className="text-accent text-2xl">✓</span>
          </div>
          <h2 className="text-headline mb-4">Request received.</h2>
          <p className="text-body">
            We'll be in touch within 48 hours.
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
              Ready to see Portolan
              <br />
              in action?
            </h2>
            
            <p className="text-body mb-8 max-w-md">
              Request access to our pilot program or schedule a technical briefing with our team.
            </p>

            {/* Alternative Contact */}
            <div className="space-y-4">
              <a
                href="mailto:contact@portolanlabs.com"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <Mail className="w-4 h-4" />
                <span className="link-underline">contact@portolanlabs.com</span>
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
          <div className="bg-surface-elevated border border-border p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="text-label mb-2 block">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="bg-background border-border focus:border-accent focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-label mb-2 block">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-background border-border focus:border-accent focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="organization" className="text-label mb-2 block">
                    Organization
                  </label>
                  <Input
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    required
                    className="bg-background border-border focus:border-accent focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="text-label mb-2 block">
                    Role
                  </label>
                  <Input
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="bg-background border-border focus:border-accent focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="text-label mb-2 block">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us about your use case..."
                  className="bg-background border-border focus:border-accent focus:ring-accent resize-none"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="requestPilot"
                    checked={formData.requestPilot}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, requestPilot: checked as boolean }))
                    }
                    className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                  />
                  <label htmlFor="requestPilot" className="text-sm text-muted-foreground cursor-pointer">
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
                  <label htmlFor="requestSecurityBrief" className="text-sm text-muted-foreground cursor-pointer">
                    Request security brief
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-foreground text-background hover:bg-foreground/90"
              >
                {isSubmitting ? 'Submitting...' : 'Submit request'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
