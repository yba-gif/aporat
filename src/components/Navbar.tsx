import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CompassLogo } from '@/components/CompassLogo';
import { useScrollToSection } from '@/hooks/useScrollToSection';
import { analytics } from '@/lib/analytics';

const navLinks = [
  { label: 'Product', href: 'product' },
  { label: 'Solutions', href: 'solutions' },
  { label: 'Security', href: 'security' },
  { label: 'Company', href: 'company' },
];

interface NavbarProps {
  onRequestAccess?: () => void;
}

export function Navbar({ onRequestAccess }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollToSection } = useScrollToSection();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  const handleRequestAccessClickClick = () => {
    analytics.trackCTA('request_access', 'navbar');
    onRequestAccess?.();
  };

  const handleTalkToSales = () => {
    analytics.trackCTA('talk_to_sales', 'navbar');
    onRequestAccess?.();
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
            <span className="font-semibold text-lg tracking-tight">ALPAGU</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline bg-transparent border-none cursor-pointer"
              >
                {link.label}
              </button>
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
              onClick={handleRequestAccessClick}
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
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors bg-transparent border-none cursor-pointer"
                >
                  {link.label}
                </button>
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
                    handleRequestAccessClick();
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
