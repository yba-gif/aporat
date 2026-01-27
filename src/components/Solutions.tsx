import { Building2, Network, Briefcase, ShieldAlert } from 'lucide-react';

interface Solution {
  icon: typeof Building2;
  title: string;
  problem: string;
  solution: string;
  outcome: string;
}

const solutions: Solution[] = [
  {
    icon: Building2,
    title: 'Government & Consular',
    problem: 'Fragmented systems and manual processes slow high-volume citizen services.',
    solution: 'Unified evidence intake, automated verification, decision workflows with full audit trails.',
    outcome: 'Reduce processing time by 60–80%',
  },
  {
    icon: Network,
    title: 'Defense & Intelligence',
    problem: 'Multi-agency operations lack visibility and secure information sharing.',
    solution: 'Verified handoff protocols, compartmentalized access, real-time situational awareness.',
    outcome: 'Unified operational picture',
  },
  {
    icon: Briefcase,
    title: 'Enterprise Compliance',
    problem: 'Decentralized vendors and regulatory fragmentation create blind spots.',
    solution: 'Centralized audit trails, policy enforcement, and evidence retention.',
    outcome: 'Enterprise-wide compliance visibility',
  },
  {
    icon: ShieldAlert,
    title: 'Fraud & Integrity Defense',
    problem: 'Document fraud and network anomalies evade siloed systems.',
    solution: 'Graph-based analysis surfaces coordinated patterns before they materialize.',
    outcome: 'Proactive threat detection at scale',
  },
];

export function Solutions() {
  return (
    <section id="solutions" className="section-padding">
      <div className="container-wide">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-label mb-4">Solutions</p>
          <h2 className="text-headline mb-4">
            Built for mission-critical operations.
          </h2>
          <p className="text-body">
            For governments, defense, and enterprises where accuracy and audit compliance are non-negotiable.
          </p>
        </div>

        {/* Solution Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {solutions.map((solution) => {
            const Icon = solution.icon;

            return (
              <div
                key={solution.title}
                className="group p-6 border border-border bg-background hover:border-line-strong transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-2 border border-border bg-secondary group-hover:border-accent group-hover:bg-accent-muted transition-colors">
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg pt-1">{solution.title}</h3>
                </div>

                <div className="space-y-4">
                  {/* Problem */}
                  <div className="pl-4 border-l border-destructive/30">
                    <p className="text-label text-destructive/80 mb-1">Problem</p>
                    <p className="text-sm text-muted-foreground">{solution.problem}</p>
                  </div>

                  {/* Solution */}
                  <div className="pl-4 border-l border-accent">
                    <p className="text-label text-accent mb-1">What Portolan does</p>
                    <p className="text-sm text-muted-foreground">{solution.solution}</p>
                  </div>

                  {/* Outcome */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-medium">{solution.outcome}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
