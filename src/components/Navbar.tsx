import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';

const navLinks = [
  { label: 'Product', href: '#product' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Security', href: '#security' },
  { label: 'Company', href: '#company' },
  { label: 'Contact', href: '#contact' },
];

function CompassLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      {/* Outer circle with arrows */}
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" />
      
      {/* Compass star - 8 points */}
      {/* Cardinal directions (N, E, S, W) - longer */}
      <path d="M50 5 L53 40 L50 45 L47 40 Z" fill="currentColor" /> {/* N */}
      <path d="M95 50 L60 53 L55 50 L60 47 Z" fill="currentColor" /> {/* E */}
      <path d="M50 95 L47 60 L50 55 L53 60 Z" fill="currentColor" /> {/* S */}
      <path d="M5 50 L40 47 L45 50 L40 53 Z" fill="currentColor" /> {/* W */}
      
      {/* Ordinal directions (NE, SE, SW, NW) - shorter */}
      <path d="M82 18 L58 42 L55 42 L58 38 Z" fill="currentColor" /> {/* NE */}
      <path d="M82 82 L58 58 L58 55 L62 58 Z" fill="currentColor" /> {/* SE */}
      <path d="M18 82 L42 58 L45 58 L42 62 Z" fill="currentColor" /> {/* SW */}
      <path d="M18 18 L42 42 L42 45 L38 42 Z" fill="currentColor" /> {/* NW */}
      
      {/* Center circle */}
      <circle cx="50" cy="50" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="50" r="3" fill="currentColor" />
      
      {/* Outer arrows pointing inward */}
      <path d="M50 8 L48 2 L52 2 Z" fill="currentColor" />
      <path d="M92 50 L98 48 L98 52 Z" fill="currentColor" />
      <path d="M50 92 L52 98 L48 98 Z" fill="currentColor" />
      <path d="M8 50 L2 52 L2 48 Z" fill="currentColor" />
    </svg>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRequestAccess = () => {
    analytics.trackCTA('request_access', 'navbar');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTalkToSales = () => {
    analytics.trackCTA('talk_to_sales', 'navbar');
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-sm border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <CompassLogo className="w-8 h-8 text-foreground" />
            <span className="font-semibold text-lg tracking-tight">Portolan Labs</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTalkToSales}
              className="text-muted-foreground hover:text-foreground"
            >
              Talk to sales
            </Button>
            <Button
              size="sm"
              onClick={handleRequestAccess}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Request access
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -mr-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background animate-fade-in">
            <div className="py-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="px-4 pt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    handleTalkToSales();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Talk to sales
                </Button>
                <Button
                  className="w-full bg-foreground text-background hover:bg-foreground/90"
                  onClick={() => {
                    handleRequestAccess();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Request access
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
