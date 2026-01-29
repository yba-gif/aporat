import { CompassLogo } from '@/components/CompassLogo';
import { Shield, Lock, Globe } from 'lucide-react';

export function TanitimFooter() {
  return (
    <footer className="py-16 bg-foreground text-background border-t border-background/10">
      <div className="container-wide">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <CompassLogo className="w-12 h-12 text-background mb-6" />
          
          <h2 className="text-2xl font-semibold mb-2">Portolan Labs</h2>
          <p className="text-background/70 mb-8">
            Sovereign infrastructure for critical operations
          </p>

          {/* Trust badges */}
          <div className="flex items-center gap-8 mb-12">
            <div className="flex items-center gap-2 text-sm text-background/70">
              <Shield className="w-4 h-4" />
              <span>KVKK Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-background/70">
              <Lock className="w-4 h-4" />
              <span>NATO-Grade Security</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-background/70">
              <Globe className="w-4 h-4" />
              <span>Full Data Sovereignty</span>
            </div>
          </div>

          {/* Classification */}
          <div className="text-xs text-background/50 font-mono">
            Document Classification: Business Confidential
          </div>
          <div className="text-xs text-background/50 mt-2">
            © {new Date().getFullYear()} Portolan Labs. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
