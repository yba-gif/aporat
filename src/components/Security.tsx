import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';
import { Lock, FileText, Users, Database, Eye, ShieldCheck } from 'lucide-react';

const securityFeatures = [
  {
    icon: Lock,
    title: 'KVKK-First Design',
    description: 'Privacy-by-design architecture aligned with Turkish data protection requirements.',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Granular RBAC with configurable permission sets and organizational hierarchies.',
  },
  {
    icon: FileText,
    title: 'Immutable Audit Logs',
    description: 'Tamper-evident logging with cryptographic verification of all system events.',
  },
  {
    icon: Database,
    title: 'Data Retention Policies',
    description: 'Configurable retention rules with automated purge and archival workflows.',
  },
  {
    icon: Eye,
    title: 'Data Minimization',
    description: 'Collect only what\'s needed. Consent-based signals for optional data fields.',
  },
  {
    icon: ShieldCheck,
    title: 'Selective Disclosure',
    description: 'Redaction workflows and need-to-know access for sensitive evidence.',
  },
];

export function Security() {
  const handleDownloadBrief = () => {
    analytics.trackCTA('security_brief', 'security');
    analytics.trackDownload('security_brief');
    // TODO: Open PDF
  };

  return (
    <section id="security" className="section-padding bg-foreground text-background">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left: Content */}
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-background/50 mb-4">
              Security & Compliance
            </p>
            <h2 className="text-headline text-background mb-6">
              Compliance infrastructure,
              <br />
              not compliance theater.
            </h2>
            
            <p className="text-lg text-background/70 mb-8 leading-relaxed">
              We do not make or influence sovereign decisions. We standardize evidence and integrity.
            </p>

            <Button
              variant="outline"
              onClick={handleDownloadBrief}
              className="border-background/20 text-background hover:bg-background hover:text-foreground transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Download security brief
            </Button>
          </div>

          {/* Right: Features Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className="group">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="p-1.5 border border-background/20 group-hover:border-accent group-hover:bg-accent/10 transition-colors">
                      <Icon className="w-4 h-4 text-background/70 group-hover:text-accent transition-colors" />
                    </div>
                    <h3 className="font-medium text-sm text-background pt-1">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-background/50 pl-10">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
