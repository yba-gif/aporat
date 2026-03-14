import { ArrowRight, Cpu, Zap, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface OpenPosition {
  id: string;
  title: string;
  location: string;
  department: string | null;
}

export function Company() {
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
    <section id="company" className="section-padding bg-surface-elevated/50 border-y border-border">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left: Türkiye */}
          <div>
            <p className="text-label mb-4">Türkiye</p>
            <h2 className="text-headline mb-6">
              Yerli altyapı. Milli karar sistemleri.
            </h2>
            
            <div className="space-y-4 text-body max-w-lg">
              <p>
                First sovereign intelligence platform for cross-border operations. Deploys on BTK/TÜBİTAK infrastructure. KVKK-native. White-label ready for ministry integration.
              </p>
              <p>
                No foreign dependency. No data leaves the border.
              </p>
            </div>

            {/* Tech Stack Indicators */}
            <div className="mt-8 flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <Cpu className="w-3 h-3 text-accent" />
                <span>On-prem deployment</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <Zap className="w-3 h-3 text-accent" />
                <span>KVKK-native</span>
              </div>
            </div>
          </div>

          {/* Right: Open Positions */}
          <div className="space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="font-semibold">Open Positions</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
                <span className="text-xs font-mono text-accent">
                  {positions.length} roles
                </span>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-background border border-border animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {positions.map((position, index) => (
                    <Link
                      key={position.id}
                      to={`/positions/${position.id}`}
                      className="group relative flex items-center justify-between gap-4 p-4 border border-border bg-background hover:bg-secondary/50 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
                        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
                      </div>

                      <div className="absolute top-2 right-2 text-[10px] font-mono text-muted-foreground/50">
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                          {position.department && (
                            <span className="text-[10px] font-mono text-accent uppercase tracking-wider">
                              {position.department}
                            </span>
                          )}
                        </div>
                        <p className="font-medium group-hover:text-accent transition-colors">
                          {position.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground font-mono">
                            {position.location}
                          </p>
                        </div>
                      </div>

                      <ArrowRight className="relative z-10 w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
