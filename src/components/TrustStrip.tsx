export function TrustStrip() {
  return (
    <section className="py-16 border-y border-border bg-surface-elevated/50">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <p className="text-label">Trusted by</p>
            <p className="text-sm text-muted-foreground">
              Pilot partners available on request
            </p>
          </div>
          
          <div className="h-px md:h-12 w-24 md:w-px bg-border" />
          
          <p className="text-sm text-muted-foreground max-w-md">
            Built for agencies, institutional operators, and compliance-heavy mobility workflows.
          </p>
        </div>
      </div>
    </section>
  );
}
