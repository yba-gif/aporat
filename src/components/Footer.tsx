import { Linkedin, Twitter } from 'lucide-react';

const links = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Security', href: '#security' },
  { label: 'Press', href: '#' },
];

const socialLinks = [
  { icon: Twitter, href: '#', label: 'X (Twitter)' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

function CompassLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className}>
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" />
      <path d="M50 5 L53 40 L50 45 L47 40 Z" fill="currentColor" />
      <path d="M95 50 L60 53 L55 50 L60 47 Z" fill="currentColor" />
      <path d="M50 95 L47 60 L50 55 L53 60 Z" fill="currentColor" />
      <path d="M5 50 L40 47 L45 50 L40 53 Z" fill="currentColor" />
      <path d="M82 18 L58 42 L55 42 L58 38 Z" fill="currentColor" />
      <path d="M82 82 L58 58 L58 55 L62 58 Z" fill="currentColor" />
      <path d="M18 82 L42 58 L45 58 L42 62 Z" fill="currentColor" />
      <path d="M18 18 L42 42 L42 45 L38 42 Z" fill="currentColor" />
      <circle cx="50" cy="50" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="50" r="3" fill="currentColor" />
      <path d="M50 8 L48 2 L52 2 Z" fill="currentColor" />
      <path d="M92 50 L98 48 L98 52 Z" fill="currentColor" />
      <path d="M50 92 L52 98 L48 98 Z" fill="currentColor" />
      <path d="M8 50 L2 52 L2 48 Z" fill="currentColor" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <CompassLogo className="w-6 h-6 text-foreground" />
            <span className="font-semibold text-sm">Portolan Labs</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
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
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Portolan Labs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
