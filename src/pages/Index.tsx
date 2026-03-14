import { SiteNav } from '@/components/site/SiteNav';
import { HeroSection } from '@/components/site/HeroSection';
import { ProblemSectionNew } from '@/components/site/ProblemSection';
import { PlatformSection } from '@/components/site/PlatformSection';
import { IntelligencePipeline } from '@/components/site/IntelligencePipeline';
import { CaseStudySection } from '@/components/site/CaseStudySection';
import { PreSubmissionSection } from '@/components/site/PreSubmissionSection';
import { ClearanceSection } from '@/components/site/ClearanceSection';
import { DeploymentSectionNew } from '@/components/site/DeploymentSection';
import { TurkiyeSection } from '@/components/site/TurkiyeSection';
import { CtaSection } from '@/components/site/CtaSection';
import { SiteFooter } from '@/components/site/SiteFooter';

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Fixed grid overlay */}
      <div className="bg-grid-overlay" />

      <SiteNav />
      <main className="relative z-10">
        <HeroSection />
        <ProblemSectionNew />
        <PlatformSection />
        <IntelligencePipeline />
        <CaseStudySection />
        <PreSubmissionSection />
        <ClearanceSection />
        <DeploymentSectionNew />
        <TurkiyeSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
