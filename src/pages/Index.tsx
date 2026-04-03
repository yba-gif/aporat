import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroVariantC } from '@/components/hero/HeroVariantC';
import { Products } from '@/components/Products';
import { HowItWorks } from '@/components/HowItWorks';
import { Solutions } from '@/components/Solutions';
import { Security } from '@/components/Security';
import { Differentiators } from '@/components/Differentiators';
import { Company } from '@/components/Company';
import { ContactDialog } from '@/components/ContactDialog';
import { Footer } from '@/components/Footer';
import { analytics } from '@/lib/analytics';

const Index = () => {
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    analytics.init();
    const sections = ['product', 'solutions', 'security', 'company'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            analytics.trackSectionView(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  // Listen for custom event from Navbar/Hero
  useEffect(() => {
    const handler = () => setContactOpen(true);
    window.addEventListener('open-contact', handler);
    return () => window.removeEventListener('open-contact', handler);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onRequestAccess={() => setContactOpen(true)} />
      <main>
        <HeroVariantC onRequestAccess={() => setContactOpen(true)} />
        <Products />
        <HowItWorks />
        <Solutions />
        <Security />
        <Differentiators />
        <Company />
      </main>
      <Footer />
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

export default Index;
