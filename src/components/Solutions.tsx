import { Layers, ShieldOff, Globe } from 'lucide-react';

interface ProblemCard {
  icon: typeof Layers;
  title: string;
  description: string;
}

const problems: ProblemCard[] = [
  {
    icon: Layers,
    title: 'Fragmented Intelligence',
    description: 'Operators toggle between disconnected systems. No unified view. No relationship awareness. Threats go undetected.',
  },
  {
    icon: ShieldOff,
    title: 'Zero Provenance',
    description: 'Decisions happen outside the system. When oversight arrives, the chain of custody doesn\'t exist.',
  },
  {
    icon: Globe,
    title: 'Adversarial Scale',
    description: 'Threat networks operate across jurisdictions. Point solutions can\'t see the network. You need infrastructure that can.',
  },
];

export function Solutions() {
  return (
    <section id="solutions" className="section-padding">
      <div className="container-wide">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-label mb-4">The Problem</p>
          <h2 className="text-headline mb-4">
            Built for environments where failure is not an option.
          </h2>
        </div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem) => {
            const Icon = problem.icon;

            return (
              <div
                key={problem.title}
                className="group p-6 border border-border bg-background hover:border-line-strong transition-all duration-300"
              >
                <div className="p-2 border border-border bg-secondary group-hover:border-accent group-hover:bg-accent-muted transition-colors w-fit mb-6">
                  <Icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>

                <h3 className="font-semibold text-lg mb-3">{problem.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
