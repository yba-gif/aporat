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
    title: 'Consular Operations',
    problem: 'Inconsistent evidence formats and manual verification drain resources.',
    solution: 'Portolan standardizes evidence packs with configurable intake templates and automated completeness checks.',
    outcome: 'Reduce back-and-forth by 30–50%',
  },
  {
    icon: Network,
    title: 'Agency Networks',
    problem: 'Multi-party workflows lack visibility and accountability.',
    solution: 'Portolan provides verified handoff protocols with SLA tracking and role-based dashboards.',
    outcome: 'Cut time-to-ready by 20–40%',
  },
  {
    icon: Briefcase,
    title: 'Corporate Mobility',
    problem: 'Decentralized vendor management creates compliance blind spots.',
    solution: 'Portolan consolidates risk posture with centralized audit trails and evidence retention.',
    outcome: 'Unified compliance visibility',
  },
  {
    icon: ShieldAlert,
    title: 'Integrity & Fraud Defense',
    problem: 'Document fraud and network anomalies slip through siloed checks.',
    solution: 'Portolan applies graph-based analysis to surface patterns and flag risks before decisions.',
    outcome: 'Early risk detection at scale',
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
            Built for high-stakes workflows.
          </h2>
          <p className="text-body">
            Purpose-built for organizations where accuracy, accountability, and audit matter.
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
