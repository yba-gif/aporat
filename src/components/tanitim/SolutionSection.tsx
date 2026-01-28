import { Check, ArrowRight } from 'lucide-react';

const solutions = [
  {
    title: 'The Truth Layer (Maris)',
    description: 'Every document gets a Digital Notary certificate. Cryptographic proof of the evidence chain for legal defensibility.',
  },
  {
    title: 'The Intelligence Nexus (Nautica)',
    description: 'When a fraudster is rejected in Berlin and applies in Ankara, Nautica knows. Cross-border intelligence no single consulate can achieve.',
  },
  {
    title: 'The Command Center (Meridian)',
    description: 'Policy updates reach all 250+ consulates in under 60 seconds. Case Management Workspace for officer review.',
  },
  {
    title: 'Pre-Submission Risk',
    description: 'Vizesepetim signals detect fraud before it reaches government systems. A unique moat no competitor can match.',
  },
];

export function SolutionSection() {
  return (
    <section className="section-padding border-t border-border">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Solution points */}
          <div>
            <p className="text-label text-accent mb-4">Solution</p>
            <h2 className="text-headline mb-6">
              Sovereign verification layer for Turkish consulates
            </h2>
            <p className="text-body mb-8 max-w-lg">
              Portolan provides the verification infrastructure that sits between agencies and consulates. The Ministry maintains full control. We provide the fabric.
            </p>

            <div className="space-y-4">
              {solutions.map((solution) => (
                <div key={solution.title} className="flex items-start gap-4">
                  <div className="p-1.5 bg-accent/10 text-accent shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{solution.title}</h3>
                    <p className="text-sm text-muted-foreground">{solution.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Architecture diagram */}
          <div className="bg-surface-elevated border border-border p-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-6">Integration Architecture</h3>
            
            <div className="space-y-4">
              {/* Flow diagram */}
              <div className="flex items-center gap-3">
                <div className="flex-1 py-3 px-4 bg-background border border-border text-center text-sm">
                  Applicant
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 py-3 px-4 bg-background border border-border text-center text-sm">
                  Agency (VFS/iDATA)
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 py-3 px-4 bg-accent/10 border-2 border-accent text-center text-sm font-medium text-accent">
                  Portolan Verification
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 py-3 px-4 bg-background border border-border text-center text-sm">
                  Consulate Decision
                </div>
                <div className="w-4" />
              </div>

              {/* Dashboard connection */}
              <div className="pt-4 border-t border-border mt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Ministry Intelligence Dashboard</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-6 text-center">
              Not a replacement for VFS/iDATA. A verification layer that sits between agencies and consulates.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
