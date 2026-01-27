import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';
import logo from '@/assets/logo.png';

const navLinks = [
  { label: 'Product', href: '#product' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Security', href: '#security' },
  { label: 'Company', href: '#company' },
  { label: 'Contact', href: '#contact' },
];

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
          <a href="#" className="flex items-center gap-2 group">
            <img 
              src={logo} 
              alt="Portolan Labs" 
              className="w-8 h-8 object-contain"
              style={{ filter: 'drop-shadow(0 0 1px currentColor)' }}
            />
            <span className="font-semibold text-lg tracking-tight">Portolan Labs</span>
          </a>

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
