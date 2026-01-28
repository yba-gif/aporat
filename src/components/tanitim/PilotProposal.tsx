import { Target, Clock, BarChart3, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const successMetrics = [
  { metric: 'Fraud patterns detected', target: '10+ distinct typologies' },
  { metric: 'Cross-consulate matches', target: '50+ duplicate documents' },
  { metric: 'Policy propagation time', target: '<60 seconds' },
  { metric: 'False positive rate', target: '<3%' },
  { metric: 'Officer time savings', target: '20%+ reduction' },
];

const deliverables = [
  'Full fraud pattern report for pilot consulate',
  'Comparison with historical detection rates',
  'Scalability assessment for 250+ deployment',
  'Cost-benefit analysis for national rollout',
];

export function PilotProposal() {
  return (
    <section className="section-padding border-t border-border">
      <div className="container-wide">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-label mb-4">Pilot Proposal</p>
          <h2 className="text-headline max-w-2xl mx-auto mb-4">
            90-day proof of value
          </h2>
          <p className="text-body max-w-xl mx-auto">
            Deploy at one high-volume consulate. Measure results. Scale on success.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Pilot details */}
          <div className="space-y-6">
            {/* Scope */}
            <div className="p-6 bg-surface-elevated border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Pilot Scope</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span>Ankara, Berlin, or London (recommended)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span>90 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume</span>
                  <span>All applications during period</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Integration</span>
                  <span>Parallel processing</span>
                </div>
              </div>
            </div>

            {/* Deliverables */}
            <div className="p-6 bg-surface-elevated border border-border">
              <div className="flex items-center gap-3 mb-4">
                <FileCheck className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Pilot Deliverables</h3>
              </div>
              <ul className="space-y-2">
                {deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <div className="w-1 h-1 bg-accent rounded-full mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Success metrics */}
          <div className="p-6 bg-accent/5 border border-accent/20">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">Success Metrics</h3>
            </div>
            
            <div className="space-y-4">
              {successMetrics.map((item) => (
                <div 
                  key={item.metric}
                  className="p-4 bg-background border border-border"
                >
                  <p className="text-sm text-muted-foreground mb-1">{item.metric}</p>
                  <p className="font-semibold text-accent">{item.target}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="mt-6 pt-6 border-t border-accent/20">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Expected timeline to production:</span>
                <span className="font-semibold">90 days from kickoff</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button size="lg" className="gap-2">
            <span>Schedule Technical Briefing</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Investment details and pricing available upon request
          </p>
        </div>
      </div>
    </section>
  );
}
