// Analytics event tracking utility
// Replace with your actual analytics provider (Segment, Mixpanel, etc.)

type AnalyticsEvent = {
  name: string;
  properties?: Record<string, unknown>;
};

class Analytics {
  private queue: AnalyticsEvent[] = [];
  private isInitialized = false;

  init() {
    this.isInitialized = true;
    // Process queued events
    this.queue.forEach(event => this.track(event.name, event.properties));
    this.queue = [];
  }

  track(name: string, properties?: Record<string, unknown>) {
    const event = { name, properties, timestamp: new Date().toISOString() };
    
    if (!this.isInitialized) {
      this.queue.push({ name, properties });
      return;
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event);
    }

    // TODO: Send to analytics provider
    // window.analytics?.track(name, properties);
  }

  // Predefined events for Portolan Labs
  trackCTA(ctaName: string, location: string) {
    this.track('cta_clicked', { cta_name: ctaName, location });
  }

  trackFormSubmit(formName: string, hasRequestedPilot: boolean) {
    this.track('form_submitted', { form_name: formName, requested_pilot: hasRequestedPilot });
  }

  trackDownload(documentName: string) {
    this.track('document_downloaded', { document_name: documentName });
  }

  trackSectionView(sectionName: string) {
    this.track('section_viewed', { section_name: sectionName });
  }

  trackProductExpanded(productName: string) {
    this.track('product_expanded', { product_name: productName });
  }
}

export const analytics = new Analytics();
