import { useState } from 'react';
import { ArrowRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const riskFactors = [
  { id: 'doc_consistency', label: 'Document consistency', weight: 0.25 },
  { id: 'biometric_match', label: 'Biometric match score', weight: 0.30 },
  { id: 'history_pattern', label: 'Historical pattern', weight: 0.20 },
  { id: 'source_verification', label: 'Source verification', weight: 0.25 },
];

const sampleScenarios = [
  {
    id: 'low',
    label: 'Routine Application',
    description: 'Standard documentation, verified identity, consistent history',
    factors: { doc_consistency: 92, biometric_match: 98, history_pattern: 88, source_verification: 95 },
  },
  {
    id: 'medium',
    label: 'Flagged for Review',
    description: 'Minor inconsistencies detected, requires human verification',
    factors: { doc_consistency: 71, biometric_match: 89, history_pattern: 65, source_verification: 78 },
  },
  {
    id: 'high',
    label: 'Elevated Risk',
    description: 'Multiple anomalies, document authenticity concerns',
    factors: { doc_consistency: 45, biometric_match: 72, history_pattern: 38, source_verification: 52 },
  },
];

export default function DemoD() {
  const [activeScenario, setActiveScenario] = useState(sampleScenarios[0]);

  const calculateScore = () => {
    let total = 0;
    riskFactors.forEach((factor) => {
      total += activeScenario.factors[factor.id as keyof typeof activeScenario.factors] * factor.weight;
    });
    return Math.round(total);
  };

  const score = calculateScore();
  const riskLevel = score >= 80 ? 'LOW' : score >= 60 ? 'MEDIUM' : 'HIGH';
  const RiskIcon = score >= 80 ? CheckCircle : score >= 60 ? AlertTriangle : XCircle;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/" className="text-sm font-medium">
            ← Back to Home
          </Link>
          <span className="text-label">Demo Variant D</span>
        </div>
      </header>

      {/* Hero */}
      <section className="section-padding border-b border-border">
        <div className="container-wide">
          <p className="text-label mb-4">Risk Assessment Sandbox</p>
          <h1 className="text-display max-w-3xl mb-6">
            Explore the scoring engine.
          </h1>
          <p className="text-subhead max-w-2xl">
            See how multi-factor analysis produces explainable risk assessments in real-time.
          </p>
        </div>
      </section>

      {/* Sandbox Interface */}
      <section className="py-20">
        <div className="container-wide">
          <div className="grid lg:grid-cols-[1fr_400px] gap-12">
            {/* Left: Scenario Selection & Factors */}
            <div>
              {/* Scenario Tabs */}
              <div className="mb-10">
                <p className="text-label mb-4">Select Scenario</p>
                <div className="flex gap-2">
                  {sampleScenarios.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => setActiveScenario(scenario)}
                      className={`px-6 py-3 text-sm font-medium transition-colors ${
                        activeScenario.id === scenario.id
                          ? 'bg-foreground text-background'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {scenario.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scenario Description */}
              <div className="mb-10 p-6 border border-border bg-surface-elevated">
                <p className="text-mono text-sm text-muted-foreground mb-2">
                  SCENARIO: {activeScenario.label.toUpperCase()}
                </p>
                <p className="text-body">{activeScenario.description}</p>
              </div>

              {/* Factor Breakdown */}
              <div>
                <p className="text-label mb-6">Factor Analysis</p>
                <div className="space-y-6">
                  {riskFactors.map((factor) => {
                    const value = activeScenario.factors[factor.id as keyof typeof activeScenario.factors];
                    return (
                      <div key={factor.id}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{factor.label}</span>
                          <span className="text-mono text-sm">{value}%</span>
                        </div>
                        <div className="h-2 bg-secondary">
                          <div
                            className={`h-full transition-all duration-500 ${
                              value >= 80
                                ? 'bg-accent'
                                : value >= 60
                                ? 'bg-foreground'
                                : 'bg-destructive'
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Weight: {(factor.weight * 100).toFixed(0)}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Score Output */}
            <div>
              <div className="sticky top-8">
                <div className="bg-foreground text-background p-10">
                  <p className="text-xs font-medium uppercase tracking-widest opacity-50 mb-8">
                    Computed Risk Score
                  </p>

                  <div className="text-center mb-10">
                    <p className="text-7xl font-semibold mb-4">{score}</p>
                    <div className="flex items-center justify-center gap-2">
                      <RiskIcon className={`w-5 h-5 ${
                        score >= 80 ? 'text-accent' : score >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`} />
                      <span className="text-sm font-medium">{riskLevel} RISK</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm opacity-70">
                    <div className="flex justify-between py-2 border-b border-background/20">
                      <span>Recommended Action</span>
                      <span className="font-medium">
                        {score >= 80 ? 'Auto-approve' : score >= 60 ? 'Manual review' : 'Escalate'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-background/20">
                      <span>Confidence</span>
                      <span className="font-medium">94.2%</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>Processing Time</span>
                      <span className="font-medium">142ms</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-6 border border-border">
                  <p className="text-xs text-muted-foreground mb-4">
                    This sandbox demonstrates scoring logic. Production deployments support custom factor weights and thresholds.
                  </p>
                  <button className="w-full py-3 bg-foreground text-background text-sm font-medium flex items-center justify-center gap-2">
                    Request Custom Demo
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
