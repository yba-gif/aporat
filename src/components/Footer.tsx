import { Linkedin, Twitter } from 'lucide-react';
import { CompassLogo } from '@/components/CompassLogo';
import { useScrollToSection } from '@/hooks/useScrollToSection';

const links = [
  { label: 'Privacy', href: null },
  { label: 'Terms', href: null },
  { label: 'Security', href: 'security' },
  { label: 'Press', href: null },
];

const socialLinks = [
  { icon: Twitter, href: '#', label: 'X (Twitter)' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export function Footer() {
  const { scrollToSection } = useScrollToSection();

  return (
    <footer className="py-12 border-t border-border">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <CompassLogo className="w-6 h-6 text-foreground" />
            <span className="font-semibold text-sm">ALPAGUT</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <button
                key={link.label}
                onClick={() => link.href && scrollToSection(link.href)}
                className={`text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none ${
                  link.href ? 'cursor-pointer' : 'cursor-default'
                }`}
                disabled={!link.href}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">
            Sovereign intelligence infrastructure.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ALPAGUT. Istanbul, Türkiye.
          </p>
        </div>
      </div>
    </footer>
  );
}
