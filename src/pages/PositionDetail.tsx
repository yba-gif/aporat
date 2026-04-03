import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArrowLeft, MapPin, Briefcase, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface OpenPosition {
  id: string;
  title: string;
  location: string;
  department: string | null;
}

const PositionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin_url: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const { data: position, isLoading } = useQuery({
    queryKey: ['position', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('open_positions')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data as OpenPosition;
    },
  });

  const submitApplication = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          position_id: id,
          name: formData.name,
          email: formData.email,
          linkedin_url: formData.linkedin_url || null,
          message: formData.message || null,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Application submitted successfully');
    },
    onError: () => {
      toast.error('Failed to submit application. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitApplication.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container-wide">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-surface-elevated" />
              <div className="h-12 w-96 bg-surface-elevated" />
              <div className="h-64 bg-surface-elevated" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!position) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container-wide text-center">
            <h1 className="text-2xl font-bold mb-4">Position not found</h1>
            <Link to="/positions" className="text-accent hover:underline">
              View all positions
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-wide">
          {/* Header */}
          <div className="mb-12">
            <Link 
              to="/positions" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-6 font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              All Positions
            </Link>
            
            {position.department && (
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-3 h-3 text-accent" />
                <span className="text-xs font-mono text-accent uppercase tracking-wider">
                  {position.department}
                </span>
              </div>
            )}
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {position.title}
            </h1>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground font-mono">
                {position.location}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left: About */}
            <div>
              <h2 className="text-xl font-semibold mb-4">About this role</h2>
              <div className="space-y-4 text-body">
                <p>
                  We're looking for a talented {position.title} to join our team in {position.location}. 
                  You'll be working on mission-critical infrastructure that powers decision-making 
                  for border agencies, defense, and regulated enterprises.
                </p>
                <p>
                  At ALPAGUT, you'll work on high-stakes problems with a team that values 
                  precision, clarity, and impact. We build systems that cannot afford to fail.
                </p>
              </div>

              <div className="mt-8 p-4 border border-border bg-surface-elevated">
                <h3 className="text-sm font-semibold mb-3 font-mono">What we offer</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-accent rounded-full" />
                    Competitive compensation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-accent rounded-full" />
                    Remote-friendly culture
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-accent rounded-full" />
                    Work on critical infrastructure
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-accent rounded-full" />
                    Small, high-impact team
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: Application Form */}
            <div>
              <div className="border border-border bg-surface-elevated p-6">
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Application Received</h3>
                    <p className="text-muted-foreground mb-6">
                      We'll review your application and get back to you soon.
                    </p>
                    <Link to="/positions">
                      <Button variant="outline">View other positions</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-6">Apply for this position</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-mono">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="bg-background border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-mono">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="bg-background border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="text-sm font-mono">
                          LinkedIn URL
                        </Label>
                        <Input
                          id="linkedin"
                          value={formData.linkedin_url}
                          onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                          placeholder="https://linkedin.com/in/..."
                          className="bg-background border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-mono">
                          Why are you interested?
                        </Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={4}
                          className="bg-background border-border resize-none"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={submitApplication.isPending}
                      >
                        {submitApplication.isPending ? (
                          'Submitting...'
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Application
                          </>
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PositionDetail;
