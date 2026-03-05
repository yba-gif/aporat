import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Printer, Mail, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

const MOCK = {
  id: 'CLR-2026-47210',
  name: 'Alexander Müller',
  nationality: 'Germany',
  passport: 'DE••••••4821',
  issueDate: 'March 5, 2026',
  expiryDate: 'September 5, 2026',
  clearance: 'STANDARD CLEARANCE',
  destination: 'Switzerland',
};

export default function P2Certificate() {
  const { id } = useParams();
  const certId = id || MOCK.id;

  return (
    <div className="p2 min-h-screen bg-white flex flex-col">
      <header className="border-b border-[--p2-gray-200] bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/p2" className="flex items-center gap-2"><img src={logo} alt="Portolan Labs" className="h-7" /></Link>
          <div className="flex items-center gap-4">
            <Link to="/p2/apply" className="text-[11px] text-[--p2-gray-500] hover:text-[--p2-blue] transition-colors">New Application</Link>
            <Link to="/p2/login" className="text-[11px] font-semibold text-[--p2-blue] hover:underline">Login</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 sm:py-12 px-4">
        <div className="max-w-[640px] mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Certificate Card */}
            <div className="rounded-2xl border-2 border-[--p2-gray-200] overflow-hidden shadow-lg">
              {/* Header band */}
              <div className="bg-gradient-to-r from-[--p2-navy] to-[--p2-navy-light] px-6 sm:px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="" className="h-6 brightness-0 invert" />
                </div>
                <Shield size={20} className="text-white/40" />
              </div>

              {/* Body */}
              <div className="px-6 sm:px-8 py-8 space-y-6">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[--p2-gray-400] font-semibold">Portolan Labs AG — Switzerland</p>
                  <h1 className="text-lg sm:text-xl font-bold text-[--p2-navy] mt-2 tracking-wide">VISA CLEARANCE CERTIFICATE</h1>
                  <p className="text-xs font-mono text-[--p2-gray-500] mt-1">{certId}</p>
                </div>

                <div className="h-px bg-[--p2-gray-200]" />

                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  {[
                    ['Applicant Name', MOCK.name],
                    ['Nationality', MOCK.nationality],
                    ['Passport Number', MOCK.passport],
                    ['Destination', MOCK.destination],
                    ['Issue Date', MOCK.issueDate],
                    ['Expiry Date', MOCK.expiryDate],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[9px] uppercase tracking-wider text-[--p2-gray-400] font-semibold">{label}</p>
                      <p className="text-xs font-semibold text-[--p2-navy] mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-[--p2-gray-200]" />

                {/* Clearance badge */}
                <div className="text-center">
                  <p className="text-[9px] uppercase tracking-wider text-[--p2-gray-400] font-semibold mb-2">Risk Clearance Level</p>
                  <span className="inline-block px-5 py-2 rounded-full bg-[--p2-green]/10 text-[--p2-green] text-sm font-bold tracking-wider border border-[--p2-green]/20">
                    {MOCK.clearance}
                  </span>
                </div>

                {/* QR + Signature */}
                <div className="flex items-end justify-between pt-2">
                  <div className="w-20 h-20 rounded-lg border-2 border-[--p2-gray-300] flex items-center justify-center bg-[--p2-gray-50]">
                    <span className="text-xs font-bold text-[--p2-gray-400] tracking-widest">QR</span>
                  </div>
                  <div className="text-right">
                    <div className="w-40 h-px bg-[--p2-gray-300] mb-1.5" />
                    <p className="text-[9px] text-[--p2-gray-400]">Digitally verified by</p>
                    <p className="text-[10px] font-semibold text-[--p2-navy]">Portolan Labs AG</p>
                  </div>
                </div>
              </div>

              {/* Footer band */}
              <div className="bg-[--p2-gray-50] border-t border-[--p2-gray-200] px-6 sm:px-8 py-3 text-center">
                <p className="text-[9px] text-[--p2-gray-400]">This certificate is electronically generated and does not require a physical signature.</p>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="h-12 px-8 text-sm gap-2 bg-[--p2-blue] hover:bg-[--p2-blue]/90 text-white w-full sm:w-auto"
              onClick={() => toast({ title: 'PDF downloaded', description: `${certId}-certificate.pdf` })}>
              <Download size={16} /> Download PDF
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-6 text-sm gap-2 w-full sm:w-auto"
              onClick={() => { window.print(); }}>
              <Printer size={16} /> Print Certificate
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-6 text-sm gap-2 w-full sm:w-auto"
              onClick={() => toast({ title: 'Email dialog opened' })}>
              <Mail size={16} /> Share via Email
            </Button>
          </motion.div>

          {/* Verification note */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="text-center">
            <p className="text-[11px] text-[--p2-gray-400] flex items-center justify-center gap-1.5">
              <ExternalLink size={10} />
              This certificate can be verified at <Link to={`/verify/${certId}`} className="text-[--p2-blue] font-medium hover:underline">verify.portolanlabs.com</Link> by scanning the QR code
            </p>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-[--p2-gray-200] py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-[--p2-gray-400]">© 2026 Portolan Labs AG. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue]">Terms of Service</a>
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue]">Privacy Policy</a>
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
