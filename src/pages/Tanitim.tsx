import { CompassLogo } from '@/components/CompassLogo';
import { Link } from 'react-router-dom';
import { TanitimHero } from '@/components/tanitim/TanitimHero';
import { MarketOpportunity } from '@/components/tanitim/MarketOpportunity';
import { ProblemSection } from '@/components/tanitim/ProblemSection';
import { SolutionSection } from '@/components/tanitim/SolutionSection';
import { TechnologySection } from '@/components/tanitim/TechnologySection';
import { ProductSuite } from '@/components/tanitim/ProductSuite';
import { ComparisonSection } from '@/components/tanitim/ComparisonSection';
import { SubsidiarySection } from '@/components/tanitim/SubsidiarySection';
import { DeploymentSection } from '@/components/tanitim/DeploymentSection';
import { PilotProposal } from '@/components/tanitim/PilotProposal';
import { TanitimFooter } from '@/components/tanitim/TanitimFooter';
import { ArrowLeft } from 'lucide-react';

export default function Tanitim() {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
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
            <span>Back to site</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14">
        <TanitimHero />
        <MarketOpportunity />
        <ProblemSection />
        <SolutionSection />
        <TechnologySection />
        <ProductSuite />
        <ComparisonSection />
        <SubsidiarySection />
        <DeploymentSection />
        <PilotProposal />
        <TanitimFooter />
      </main>
    </div>
  );
}
