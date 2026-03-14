import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'PLATFORM', href: 'platform' },
  { label: 'INTELLIGENCE', href: 'intelligence' },
  { label: 'CLEARANCE', href: 'clearance' },
  { label: 'DEPLOYMENT', href: 'deployment' },
  { label: 'TÜRKIYE', href: 'turkiye' },
];

export function SiteNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border"
      style={{
        background: 'rgba(5,5,8,0.85)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="container-wide h-full flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-0 bg-transparent border-none cursor-pointer">
          <span className="text-[15px] font-semibold tracking-[2.5px] uppercase text-foreground">PORTOLAN</span>
          <span className="text-[15px] font-semibold tracking-[2.5px] uppercase text-accent-red">LABS</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              className="text-[13px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <button
            onClick={() => scrollTo('cta')}
            className="px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider bg-accent-red text-white border-none cursor-pointer hover:opacity-90 transition-opacity"
          >
            REQUEST DEMO
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 text-foreground bg-transparent border-none cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border animate-fade-in" style={{ background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(20px)' }}>
          <div className="container-wide py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="block w-full text-left px-4 py-3 text-[13px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
              >
                {link.label}
              </button>
            ))}
            <div className="px-4 pt-4">
              <button
                onClick={() => { scrollTo('cta'); }}
                className="w-full px-5 py-3 text-[12px] font-semibold uppercase tracking-wider bg-accent-red text-white border-none cursor-pointer"
              >
                REQUEST DEMO
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
