import { X, AlertTriangle } from 'lucide-react';

const problems = [
  {
    title: 'Cross-consulate fraud invisible',
    description: 'Same forged bank statement accepted at 5 different consulates because systems do not share intelligence.',
  },
  {
    title: 'Manual document review at scale',
    description: 'Officers have seconds per application while fraud networks have months to prepare coordinated attacks.',
  },
  {
    title: 'Policy propagation delays',
    description: 'Visa restrictions and diplomatic changes take weeks to reach all 250+ posts globally.',
  },
  {
    title: 'No relationship graph',
    description: 'Visa mill networks appear as unrelated individuals. Coordinated fraud looks like normal traffic.',
  },
  {
    title: 'Audit trail gaps',
    description: 'Decisions difficult to trace back through evidence chain. Accountability requires manual reconstruction.',
  },
  {
    title: 'Data sovereignty concerns',
    description: 'Current systems route Turkish citizen data through foreign infrastructure and jurisdictions.',
  },
];

export function ProblemSection() {
  return (
    <section className="section-padding bg-surface-elevated border-t border-border">
      <div className="container-wide">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <p className="text-label text-destructive">Problem</p>
        </div>
        <h2 className="text-headline mb-12 max-w-2xl">
          Current systems were built for logistics, not verification
        </h2>

        {/* Problems grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem) => (
            <div 
              key={problem.title}
              className="p-6 bg-background border border-border"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="p-1.5 bg-destructive/10 text-destructive shrink-0">
                  <X className="w-4 h-4" />
                </div>
                <h3 className="font-medium">{problem.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground pl-9">
                {problem.description}
              </p>
            </div>
          ))}
        </div>

        {/* Callout */}
        <div className="mt-12 p-6 bg-destructive/5 border border-destructive/20 text-center">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Real example:</strong> TikTok and social media networks now teach forged court document creation for asylum claims. Spreading faster than manual detection can respond.
          </p>
        </div>
      </div>
    </section>
  );
}
