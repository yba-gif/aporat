import { CompassLogo } from '@/components/CompassLogo';
import { Shield, Lock, Globe } from 'lucide-react';

export function HudaFooter() {
  return (
    <footer className="py-16 bg-foreground text-background border-t border-background/10">
      <div className="container-wide">
        <div className="flex flex-col items-center text-center">
          <CompassLogo className="w-12 h-12 text-background mb-6" />
          
          <h2 className="text-2xl font-semibold mb-2">HUDA</h2>
          <p className="text-background/70 mb-1 text-sm">by Portolan Labs</p>
          <p className="text-background/50 mb-8 text-sm">
            Yerel seçimler için kampanya istihbarat platformu
          </p>

          <div className="flex items-center gap-8 mb-12">
            <div className="flex items-center gap-2 text-sm text-background/70">
              <Shield className="w-4 h-4" />
              <span>KVKK Uyumlu</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-background/70">
              <Lock className="w-4 h-4" />
              <span>Veri Egemenliği</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-background/70">
              <Globe className="w-4 h-4" />
              <span>Yerinde Kurulum</span>
            </div>
          </div>

          <div className="text-xs text-background/50 font-mono">
            Belge Sınıflandırması: İş Gizliliği
          </div>
          <div className="text-xs text-background/50 mt-2">
            © {new Date().getFullYear()} Portolan Labs. Tüm hakları saklıdır.
          </div>
        </div>
      </div>
    </footer>
  );
}
