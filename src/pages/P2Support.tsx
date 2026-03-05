import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Mail, Clock, Lock, Shield, Award, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

const FAQS = [
  { q: 'How long does the clearance process take?', a: 'Standard processing takes 48–72 hours from submission. Express processing is completed within 24 hours. Processing times may vary during peak periods or if additional verification is required.' },
  { q: 'What documents do I need?', a: 'You\'ll need a clear scan of your passport photo page (JPG, PNG, or PDF, max 5MB). Supporting documents such as a bank statement, employment letter, or invitation letter are optional but can speed up the process.' },
  { q: 'How is my data protected?', a: 'All data is encrypted with 256-bit SSL and stored in Swiss-based data centres under strict Swiss and EU data protection laws. We are ISO 27001 certified and fully GDPR compliant.' },
  { q: 'What happens if my application is denied?', a: 'If denied, you\'ll receive a detailed explanation of the reasons. You can appeal the decision within 30 days at no additional cost, or contact our support team for guidance on next steps.' },
  { q: 'Can I expedite my application?', a: 'Yes. You can select Express Processing during checkout for CHF 149 (vs CHF 89 for standard). Express applications are prioritised and completed within 24 hours.' },
  { q: 'How do I verify my certificate?', a: 'Visit verify.portolanlabs.com and enter your certificate ID, or scan the QR code printed on your certificate. Verification is free and available to anyone, including consulates and employers.' },
  { q: 'What countries accept Portolan certificates?', a: 'Portolan clearance certificates are recognised by consulates and immigration authorities in over 40 countries, including most EU and Schengen zone nations, the UK, Canada, and Australia.' },
  { q: 'How do I get a refund?', a: 'Refunds are available within 14 days of purchase if your application has not yet entered the screening stage. Contact support@portolanlabs.com with your application ID to request a refund.' },
];

const BADGES = [
  { label: 'Swiss Data Protection', flag: '🇨🇭', icon: Shield },
  { label: 'GDPR Compliant', flag: '🇪🇺', icon: Shield },
  { label: '256-bit Encryption', flag: null, icon: Lock },
  { label: 'ISO 27001 Certified', flag: null, icon: Award },
];

export default function P2Support() {
  const [form, setForm] = useState({ name: '', email: '', appId: '', category: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    toast({ title: 'Message sent!', description: 'We\'ll get back to you within 24 hours.' });
    setForm({ name: '', email: '', appId: '', category: '', message: '' });
  };

  return (
    <div className="p2 min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-[--p2-gray-200] bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/p2" className="flex items-center gap-2"><img src={logo} alt="Portolan Labs" className="h-7" /></Link>
          <div className="flex items-center gap-4">
            <Link to="/p2/apply" className="text-[11px] text-[--p2-gray-500] hover:text-[--p2-blue] transition-colors">Apply Now</Link>
            <Link to="/p2/login" className="text-[11px] font-semibold text-[--p2-blue] hover:underline">Login</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 sm:py-12 px-4">
        <div className="max-w-[800px] mx-auto space-y-12">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-[--p2-navy]">Help & Support</h1>
            <p className="text-xs text-[--p2-gray-500] mt-1">Find answers or get in touch with our team</p>
          </motion.div>

          {/* FAQ */}
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <h2 className="text-sm font-bold text-[--p2-navy] mb-4">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="rounded-2xl border border-[--p2-gray-200] overflow-hidden">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-b border-[--p2-gray-100] last:border-0">
                  <AccordionTrigger className="px-5 py-4 text-xs font-semibold text-[--p2-navy] hover:text-[--p2-blue] hover:no-underline transition-colors [&[data-state=open]]:text-[--p2-blue]">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4 text-[11px] text-[--p2-gray-600] leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.section>

          {/* Contact */}
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <h2 className="text-sm font-bold text-[--p2-navy] mb-4">Still need help?</h2>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6">
              {/* Form */}
              <form onSubmit={handleSubmit} className="rounded-2xl border border-[--p2-gray-200] p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-[--p2-gray-700]">Name *</Label>
                    <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" className="mt-1.5 h-11" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-[--p2-gray-700]">Email *</Label>
                    <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" className="mt-1.5 h-11" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-[--p2-gray-700]">Application ID <span className="text-[--p2-gray-400]">(optional)</span></Label>
                    <Input value={form.appId} onChange={e => setForm(p => ({ ...p, appId: e.target.value }))} placeholder="CLR-2026-XXXXX" className="mt-1.5 h-11 font-mono" />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-[--p2-gray-700]">Category</Label>
                    <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                      <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {['General', 'Technical', 'Billing', 'Appeal'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium text-[--p2-gray-700]">Message *</Label>
                  <Textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Describe your issue or question…" className="mt-1.5" rows={5} />
                </div>
                <Button type="submit" className="h-11 px-6 text-xs gap-1.5 bg-[--p2-blue] hover:bg-[--p2-blue]/90 text-white">
                  <Send size={13} /> Send Message
                </Button>
              </form>

              {/* Side info */}
              <div className="space-y-4">
                {[
                  { icon: Clock, label: 'Support Hours', value: 'Mon–Fri, 9:00–18:00 CET' },
                  { icon: Mail, label: 'Email', value: 'support@portolanlabs.com' },
                  { icon: Clock, label: 'Response Time', value: 'Within 24 hours' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl border border-[--p2-gray-200] p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[--p2-blue]/8 flex items-center justify-center shrink-0">
                      <item.icon size={14} className="text-[--p2-blue]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[--p2-gray-400] font-semibold uppercase tracking-wider">{item.label}</p>
                      <p className="text-xs font-medium text-[--p2-navy] mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Trust Badges */}
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BADGES.map(b => (
                <div key={b.label} className="rounded-xl border border-[--p2-gray-200] p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1.5">
                    {b.flag && <span className="text-base">{b.flag}</span>}
                    <b.icon size={14} className="text-[--p2-navy]" />
                  </div>
                  <p className="text-[10px] font-semibold text-[--p2-navy]">{b.label}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <footer className="border-t border-[--p2-gray-200] py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-[--p2-gray-400]">© 2026 Portolan Labs AG. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue]">Terms</a>
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue]">Privacy</a>
            <a href="#" className="text-[10px] text-[--p2-gray-400] hover:text-[--p2-blue]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
