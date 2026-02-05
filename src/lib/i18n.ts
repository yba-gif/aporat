// Simple i18n system for Turkish/English localization

export type Locale = 'en' | 'tr';

const translations = {
  en: {
    // Actions
    approve: 'Approve',
    reject: 'Reject',
    escalate: 'Escalate',
    pending: 'Pending',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    export: 'Export',
    reset: 'Reset',
    view: 'View',
    download: 'Download',
    copy: 'Copy',
    
    // Status
    approved: 'Approved',
    rejected: 'Rejected',
    escalated: 'Escalated',
    pendingReview: 'Pending Review',
    inProgress: 'In Progress',
    completed: 'Completed',
    flagged: 'Flagged',
    clean: 'Clean',
    
    // Modules
    maris: 'Maris',
    nautica: 'Nautica',
    meridian: 'Meridian',
    evidence: 'Evidence',
    intelligence: 'Intelligence',
    governance: 'Governance',
    
    // Entities
    applicant: 'Applicant',
    agency: 'Agency',
    company: 'Company',
    address: 'Address',
    document: 'Document',
    documents: 'Documents',
    case: 'Case',
    cases: 'Cases',
    
    // Labels
    riskScore: 'Risk Score',
    caseManagement: 'Case Management',
    decisionWorkflow: 'Decision Workflow',
    documentVault: 'Document Vault',
    networkGraph: 'Network Graph',
    activeAlerts: 'Active Alerts',
    redFlags: 'Red Flags',
    justification: 'Justification',
    workflow: 'Workflow',
    overview: 'Overview',
    connections: 'Connections',
    
    // Meridian specific
    makeDecision: 'Make Decision',
    confirmDecision: 'Confirm Decision',
    decisionReason: 'Decision Reason',
    additionalNotes: 'Additional Notes',
    exportCaseSummary: 'Export Case Summary',
    generateJustification: 'Generate Justification',
    copyToClipboard: 'Copy to Clipboard',
    regenerate: 'Regenerate',
    
    // External data
    externalData: 'External Data',
    webhookReceived: 'Webhook Received',
    correlationsFound: 'Correlations Found',
    mobileMatches: 'Mobile Matches',
    ipMatches: 'IP Matches',
    vpnDetected: 'VPN Detected',
    duplicateMobile: 'Duplicate Mobile',
    sharedIp: 'Shared IP',
    
    // Demo
    demoMode: 'Demo Mode',
    simulateWebhook: 'Simulate Webhook',
    resetDemoData: 'Reset Demo Data',
    scenarioPresets: 'Scenario Presets',
  },
  tr: {
    // Actions
    approve: 'Onayla',
    reject: 'Reddet',
    escalate: 'Eskalasyon',
    pending: 'Beklemede',
    submit: 'Gönder',
    cancel: 'İptal',
    save: 'Kaydet',
    export: 'Dışa Aktar',
    reset: 'Sıfırla',
    view: 'Görüntüle',
    download: 'İndir',
    copy: 'Kopyala',
    
    // Status
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    escalated: 'Eskalasyon Yapıldı',
    pendingReview: 'İnceleme Bekliyor',
    inProgress: 'Devam Ediyor',
    completed: 'Tamamlandı',
    flagged: 'İşaretli',
    clean: 'Temiz',
    
    // Modules
    maris: 'Maris',
    nautica: 'Nautica',
    meridian: 'Meridian',
    evidence: 'Kanıt',
    intelligence: 'İstihbarat',
    governance: 'Yönetişim',
    
    // Entities
    applicant: 'Başvuran',
    agency: 'Ajans',
    company: 'Şirket',
    address: 'Adres',
    document: 'Belge',
    documents: 'Belgeler',
    case: 'Dosya',
    cases: 'Dosyalar',
    
    // Labels
    riskScore: 'Risk Skoru',
    caseManagement: 'Dosya Yönetimi',
    decisionWorkflow: 'Karar Akışı',
    documentVault: 'Belge Kasası',
    networkGraph: 'Ağ Grafiği',
    activeAlerts: 'Aktif Uyarılar',
    redFlags: 'Kırmızı Bayraklar',
    justification: 'Gerekçe',
    workflow: 'İş Akışı',
    overview: 'Genel Bakış',
    connections: 'Bağlantılar',
    
    // Meridian specific
    makeDecision: 'Karar Ver',
    confirmDecision: 'Kararı Onayla',
    decisionReason: 'Karar Nedeni',
    additionalNotes: 'Ek Notlar',
    exportCaseSummary: 'Dosya Özetini Dışa Aktar',
    generateJustification: 'Gerekçe Oluştur',
    copyToClipboard: 'Panoya Kopyala',
    regenerate: 'Yeniden Oluştur',
    
    // External data
    externalData: 'Harici Veri',
    webhookReceived: 'Webhook Alındı',
    correlationsFound: 'Korelasyon Bulundu',
    mobileMatches: 'Telefon Eşleşmeleri',
    ipMatches: 'IP Eşleşmeleri',
    vpnDetected: 'VPN Tespit Edildi',
    duplicateMobile: 'Yinelenen Telefon',
    sharedIp: 'Paylaşılan IP',
    
    // Demo
    demoMode: 'Demo Modu',
    simulateWebhook: 'Webhook Simüle Et',
    resetDemoData: 'Demo Verisini Sıfırla',
    scenarioPresets: 'Senaryo Ön Ayarları',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

// Get current locale from URL param or default to Turkish for demo
export function getLocale(): Locale {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    if (lang === 'en' || lang === 'tr') return lang;
  }
  return 'tr'; // Default to Turkish for MFA demo
}

export function t(key: TranslationKey, locale?: Locale): string {
  const currentLocale = locale || getLocale();
  return translations[currentLocale][key] || translations.en[key] || key;
}

// Hook for React components
import { useState, useEffect } from 'react';

export function useLocale() {
  const [locale, setLocale] = useState<Locale>(getLocale());

  useEffect(() => {
    const handleUrlChange = () => {
      setLocale(getLocale());
    };
    
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const changeLocale = (newLocale: Locale) => {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', newLocale);
    window.history.pushState({}, '', url.toString());
    setLocale(newLocale);
  };

  return { locale, changeLocale, t: (key: TranslationKey) => t(key, locale) };
}
