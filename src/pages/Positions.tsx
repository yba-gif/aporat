import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArrowLeft, MapPin, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OpenPosition {
  id: string;
  title: string;
  location: string;
  department: string | null;
}

const Positions = () => {
  const { data: positions = [], isLoading } = useQuery({
    queryKey: ['open-positions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('open_positions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as OpenPosition[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-wide">
          {/* Header */}
          <div className="mb-12">
            <Link 
              to="/#company" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-6 font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-mono text-accent uppercase tracking-wider">
                Actively Hiring
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Open Positions
            </h1>
            <p className="text-body max-w-2xl">
              Join us in building decision infrastructure for the world's most critical operations.
            </p>
          </div>

          {/* Positions Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-surface-elevated border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {positions.map((position, index) => (
                <Link
                  key={position.id}
                  to={`/positions/${position.id}`}
                  className="group relative p-6 border border-border bg-surface-elevated hover:bg-secondary/50 transition-all duration-300 overflow-hidden"
                >
                  {/* Animated border effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
                    <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-transparent via-accent/50 to-transparent" />
                    <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-accent/50 to-transparent" />
                  </div>

                  {/* Index number */}
                  <div className="absolute top-3 right-3 text-[10px] font-mono text-muted-foreground/50">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="relative z-10">
                    {position.department && (
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-3 h-3 text-accent" />
                        <span className="text-[10px] font-mono text-accent uppercase tracking-wider">
                          {position.department}
                        </span>
                      </div>
                    )}
                    
                    <h2 className="text-lg font-semibold mb-3 group-hover:text-accent transition-colors">
                      {position.title}
                    </h2>
                    
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground font-mono">
                        {position.location}
                      </span>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <span className="text-accent font-mono text-sm">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap items-center gap-8 text-sm text-muted-foreground font-mono">
              <div className="flex items-center gap-2">
                <span className="text-accent">{positions.length}</span>
                <span>open roles</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div>Remote-friendly positions available</div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Positions;
