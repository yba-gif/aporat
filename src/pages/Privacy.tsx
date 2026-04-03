import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-32 pb-20">
      <div className="container-wide max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. Data Controller</h2>
            <p>ALPAGUT ("we", "us") is the data controller for personal data processed through this website and our platform services. Our registered office is in Istanbul, Turkiye.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. Data We Collect</h2>
            <p className="mb-2">We collect the following categories of personal data:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Contact information (name, email, organization, role) submitted through forms</li>
              <li>Technical data (IP address, browser type, device information) collected automatically</li>
              <li>Usage data (pages visited, features used) for analytics purposes</li>
              <li>Platform data processed on behalf of our enterprise and government clients</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To respond to inquiries and provide requested information</li>
              <li>To deliver and maintain our platform services</li>
              <li>To improve our products and user experience</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. Data Sharing</h2>
            <p>We do not sell personal data. We may share data with service providers who assist in operating our platform, subject to strict contractual obligations. For government and enterprise deployments, data remains within the client's designated infrastructure.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. Data Retention</h2>
            <p>We retain personal data only as long as necessary for the purposes described above or as required by law. Contact form submissions are retained for 24 months unless you request earlier deletion.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Security</h2>
            <p>We implement appropriate technical and organizational measures to protect personal data, including encryption in transit and at rest, access controls, and regular security assessments.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Request data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. Contact</h2>
            <p>For privacy-related inquiries, contact us at <a href="mailto:privacy@alpagut.com" className="text-foreground underline">privacy@alpagut.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;
