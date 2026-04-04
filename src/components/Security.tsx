import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';
import { Lock, Server, Cloud, Wifi, Shield, FileText } from 'lucide-react';

const deploymentModes = [
  { icon: Server, label: 'On-Premise' },
  { icon: Cloud, label: 'Sovereign Cloud' },
  { icon: Wifi, label: 'Air-Gapped' },
  { icon: Shield, label: 'Hybrid' },
];

const certifications = [
  '256-bit encryption',
  'ISO 27001',
  'GDPR & KVKK',
  'Zero-trust',
  'Full audit logging',
];

export function Security() {
  const handleDownloadBrief = () => {
    analytics.trackCTA('security_brief', 'security');
    analytics.trackDownload('security_brief');
  };

  return (
    <section id="security" className="section-padding bg-foreground text-background">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left: Content */}
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-background/50 mb-4">
              Deployment
            </p>
            <h2 className="text-headline text-background mb-6">
              Your data. Your jurisdiction.
              <br />
              Your rules.
            </h2>
            
            <p className="text-lg text-background/70 mb-8 leading-relaxed">
              Deploy where your mandate requires. We provide the infrastructure. You define the boundaries.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {deploymentModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <div key={mode.label} className="flex items-center gap-3 p-3 border border-background/10">
                    <Icon className="w-4 h-4 text-accent" />
                    <span className="text-sm text-background/80">{mode.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              {certifications.map((cert) => (
                <span key={cert} className="px-3 py-1 text-xs font-mono border border-background/20 text-background/60">
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Clearance */}
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-background/50 mb-4">
              Clearance
            </p>
            <p className="text-background/70 mb-8">
              Cryptographic clearance certificates. Portable. Tamper-proof. QR-verifiable. Accepted in 40+ countries.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-6 border border-background/10 text-center">
                <p className="text-2xl font-semibold text-background mb-1">CHF 89</p>
                <p className="text-sm text-background/50">Standard</p>
              </div>
              <div className="p-6 border border-accent/40 bg-accent/5 text-center">
                <p className="text-2xl font-semibold text-accent mb-1">CHF 149</p>
                <p className="text-sm text-background/50">Enhanced</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleDownloadBrief}
              className="border-background/20 text-background hover:bg-background hover:text-foreground transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Download security brief
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
