import { CompassLogo } from '@/components/CompassLogo';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { HudaHero } from '@/components/huda/HudaHero';
import { HudaMarketContext } from '@/components/huda/HudaMarketContext';

import { HudaSolution } from '@/components/huda/HudaSolution';
import { HudaScenario } from '@/components/huda/HudaScenario';
import { HudaMockups } from '@/components/huda/HudaMockups';
import { HudaTechnology } from '@/components/huda/HudaTechnology';
import { HudaComparison } from '@/components/huda/HudaComparison';
import { HudaTimeline } from '@/components/huda/HudaTimeline';
import { HudaFooter } from '@/components/huda/HudaFooter';


export default function Huda() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container-wide h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <CompassLogo className="w-7 h-7" />
            <span className="font-semibold text-sm">Portolan Labs</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Siteye dön</span>
          </Link>
        </div>
      </header>

      <main className="pt-14">
        <div data-tour="hero"><HudaHero /></div>
        <HudaMarketContext />
        
        <div data-tour="solution"><HudaSolution /></div>
        <div data-tour="scenario"><HudaScenario /></div>
        <div data-tour="mockups"><HudaMockups /></div>
        <HudaTechnology />
        <div data-tour="comparison"><HudaComparison /></div>
        <HudaTimeline />
        <HudaFooter />
      </main>

      
    </div>
  );
}
