const platformLinks = ['Maris', 'Nautica', 'Meridian', 'Clearance Certificates'];
const companyLinks = ['About', 'Careers', 'Security', 'Press'];
const resourceLinks = ['Documentation', 'Compliance', 'Partners', 'Contact'];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12">
          {/* Column 1: Logo + description */}
          <div>
            <div className="flex items-center gap-0 mb-4">
              <span className="text-[15px] font-semibold tracking-[2.5px] uppercase text-foreground">PORTOLAN</span>
              <span className="text-[15px] font-semibold tracking-[2.5px] uppercase text-accent-red">LABS</span>
            </div>
            <p className="text-[14px] text-muted-foreground max-w-sm">
              Sovereign intelligence infrastructure for governments, financial institutions, and border security operations. Headquartered in Switzerland.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[2px] mb-4" style={{ color: 'hsl(var(--text-muted))' }}>Platform</h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link}>
                  <span className="text-[14px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{link}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[2px] mb-4" style={{ color: 'hsl(var(--text-muted))' }}>Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link}>
                  <span className="text-[14px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{link}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[2px] mb-4" style={{ color: 'hsl(var(--text-muted))' }}>Resources</h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link}>
                  <span className="text-[14px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{link}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px]" style={{ color: 'hsl(var(--text-muted))' }}>
            &copy; 2026 Portolan Labs AG. All rights reserved.
          </p>
          <p className="text-[12px]" style={{ color: 'hsl(var(--text-muted))' }}>
            Zurich, Switzerland
          </p>
        </div>
      </div>
    </footer>
  );
}
