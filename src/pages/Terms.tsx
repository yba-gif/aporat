import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Terms = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-32 pb-20">
      <div className="container-wide max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. Acceptance</h2>
            <p>By accessing or using ALPAGUT's website and services, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. Services</h2>
            <p>ALPAGUT provides mobility compliance infrastructure, including evidence ingestion, integrity verification, and policy enforcement tools for enterprise and government clients. Access to platform features requires a valid service agreement.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. Accounts</h2>
            <p>Platform access requires authorized credentials. You are responsible for maintaining the confidentiality of your account and for all activities under your credentials. Notify us immediately of any unauthorized use.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. Acceptable Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the services for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any system or network</li>
              <li>Interfere with or disrupt the integrity or performance of the services</li>
              <li>Reverse engineer, decompile, or disassemble any part of the platform</li>
              <li>Share access credentials with unauthorized parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. Intellectual Property</h2>
            <p>All content, software, and technology provided through ALPAGUT's services are the exclusive property of ALPAGUT or its licensors. No license or right is granted except as expressly set forth in a written agreement.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Confidentiality</h2>
            <p>Both parties agree to maintain the confidentiality of proprietary information disclosed during the use of the services. This obligation survives termination of the agreement.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, ALPAGUT shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. Governing Law</h2>
            <p>These terms are governed by the laws of the Republic of Turkiye. Any disputes shall be resolved in the courts of Istanbul.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">9. Changes</h2>
            <p>We may update these terms at any time. Continued use of the services after changes constitutes acceptance of the revised terms.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">10. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:legal@alpagut.com" className="text-foreground underline">legal@alpagut.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
