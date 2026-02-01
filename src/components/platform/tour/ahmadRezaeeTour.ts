import { TourStep } from '@/contexts/TourContext';

// Ahmad Rezaee Visa Fraud Case - Guided Tour Steps
export const ahmadRezaeeTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Portolan',
    content: 'This walkthrough demonstrates how Portolan detected a coordinated visa fraud ring involving Ahmad Rezaee. You\'ll see how our three modules—Maris, Nautica, and Meridian—work together to surface, analyze, and resolve threats.',
    position: 'center',
  },
  {
    id: 'nautica-intro',
    title: 'Intelligence Nexus',
    content: 'We begin in Nautica, our relationship intelligence engine. This graph visualizes entities extracted from visa applications and cross-referenced against external databases.',
    module: 'nautica',
    target: '[data-tour="graph-container"]',
    position: 'right',
  },
  {
    id: 'ahmad-node',
    title: 'Ahmad Rezaee — Primary Subject',
    content: 'Ahmad Rezaee submitted a tourist visa application from Tehran. Initial screening flagged inconsistencies in his employment verification and financial documentation.',
    module: 'nautica',
    entityId: 'app-rezaee',
    target: '[data-tour="entity-dossier"]',
    position: 'left',
  },
  {
    id: 'fraud-pattern',
    title: 'Fraud Pattern Detected',
    content: 'Nautica detected that Ahmad\'s declared employer—"Tehran Import Co"—is linked to 6 other applicants in the past 90 days. All applications share the same employer address but different company names.',
    module: 'nautica',
    target: '[data-tour="flagged-entities"]',
    position: 'bottom',
  },
  {
    id: 'social-intel',
    title: 'Social Intelligence Layer',
    content: 'OSINT analysis revealed Ahmad follows 3 accounts flagged for visa coaching on Telegram. His LinkedIn shows employment at a different company than his visa application states.',
    module: 'nautica',
    target: '[data-tour="social-panel"]',
    position: 'left',
  },
  {
    id: 'maris-evidence',
    title: 'Evidence Vault',
    content: 'Switching to Maris—our document intelligence module. All supporting documents are cryptographically hashed and stored for forensic analysis.',
    module: 'maris',
    target: '[data-tour="document-vault"]',
    position: 'right',
  },
  {
    id: 'document-analysis',
    title: 'Document Anomalies',
    content: 'Maris detected metadata anomalies in Ahmad\'s bank statement: the PDF was created 2 hours before submission, and OCR extracted a different account holder name embedded in a hidden layer.',
    module: 'maris',
    target: '[data-tour="tamper-detection"]',
    position: 'left',
  },
  {
    id: 'meridian-case',
    title: 'Case Management',
    content: 'Finally, Meridian consolidates all findings into an auditable case file. Every piece of evidence, every connection, and every decision is logged with full provenance.',
    module: 'meridian',
    target: '[data-tour="case-management"]',
    position: 'right',
  },
  {
    id: 'decision-workflow',
    title: 'Decision Workflow',
    content: 'The case was escalated for manual review. An analyst confirmed the fraud pattern and issued a rejection with reason codes. The decision is cryptographically signed and immutable.',
    module: 'meridian',
    target: '[data-tour="decision-workflow"]',
    position: 'left',
  },
  {
    id: 'conclusion',
    title: 'Case Resolution',
    content: 'Ahmad Rezaee\'s application was rejected. The fraud ring—involving 7 applicants and 2 facilitation agents—has been flagged for ongoing monitoring. Total processing time: 4.2 hours vs. industry average of 14 days.',
    position: 'center',
  },
];

export function getAhmadRezaeeTour() {
  return ahmadRezaeeTourSteps;
}
