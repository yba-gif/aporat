import { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroVariantC } from '@/components/hero/HeroVariantC';
import { Products } from '@/components/Products';
import { HowItWorks } from '@/components/HowItWorks';
import { Solutions } from '@/components/Solutions';
import { Security } from '@/components/Security';
import { Differentiators } from '@/components/Differentiators';
import { Company } from '@/components/Company';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { analytics } from '@/lib/analytics';

const Index = () => {
  useEffect(() => {
    // Initialize analytics
    analytics.init();

    // Track section views on scroll
    const sections = ['product', 'solutions', 'security', 'company', 'contact'];
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSelector />
        <Products />
        <HowItWorks />
        <Solutions />
        <Security />
        <Differentiators />
        <Company />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
