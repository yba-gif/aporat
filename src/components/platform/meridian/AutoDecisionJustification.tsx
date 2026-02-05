import { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check,
  RefreshCw,
  Languages,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface JustificationProps {
  decisionType: 'approve' | 'reject' | 'escalate';
  applicantName: string;
  caseNumber: string;
  riskScore: number;
  flags: string[];
}

type Language = 'en' | 'tr';

const TEMPLATES = {
  reject: {
    en: (name: string, caseNum: string, flags: string[]) => `
VISA APPLICATION REJECTION NOTICE

Case Reference: ${caseNum}
Applicant: ${name}
Decision: APPLICATION DENIED

Dear ${name},

After thorough review of your visa application and supporting documentation, we regret to inform you that your application has been REJECTED.

GROUNDS FOR REJECTION:

${flags.map((flag, i) => `${i + 1}. ${flag}`).join('\n')}

LEGAL BASIS:
This decision is made pursuant to Article 32 of the Visa Code (Regulation (EC) No 810/2009) and is based on the following considerations:

• Failure to provide reliable supporting documentation
• Concerns regarding the authenticity of submitted documents
• Adverse findings during security verification

RIGHT OF APPEAL:
You have the right to appeal this decision within 60 days of receipt of this notification. Appeals must be submitted in writing to the designated appeals authority.

This decision has been recorded in the relevant database systems in accordance with applicable data protection regulations.

Issued by: Republic of Turkey - Ministry of Foreign Affairs
Date: ${new Date().toISOString().split('T')[0]}
    `.trim(),
    tr: (name: string, caseNum: string, flags: string[]) => `
VİZE BAŞVURUSU RED KARARI

Dosya Referansı: ${caseNum}
Başvuru Sahibi: ${name}
Karar: BAŞVURU REDDEDİLDİ

Sayın ${name},

Vize başvurunuzun ve destekleyici belgelerinizin kapsamlı incelenmesinin ardından, başvurunuzun REDDEDİLDİĞİNİ bildirmekten üzüntü duyuyoruz.

RET GEREKÇELERİ:

${flags.map((flag, i) => `${i + 1}. ${flag}`).join('\n')}

HUKUKİ DAYANAK:
Bu karar, Vize Kodu'nun 32. Maddesi (AB Tüzüğü 810/2009) uyarınca ve aşağıdaki hususlar göz önünde bulundurularak verilmiştir:

• Güvenilir destekleyici belge sağlanamaması
• Sunulan belgelerin özgünlüğüne ilişkin endişeler
• Güvenlik doğrulaması sırasında tespit edilen olumsuz bulgular

İTİRAZ HAKKI:
Bu karara karşı, bildirim tarihinden itibaren 60 gün içinde itiraz etme hakkına sahipsiniz. İtirazlar, belirlenen itiraz makamına yazılı olarak sunulmalıdır.

Bu karar, yürürlükteki veri koruma düzenlemelerine uygun olarak ilgili veritabanı sistemlerine kaydedilmiştir.

Düzenleyen: Türkiye Cumhuriyeti Dışişleri Bakanlığı
Tarih: ${new Date().toISOString().split('T')[0]}
    `.trim()
  },
  approve: {
    en: (name: string, caseNum: string, _flags: string[]) => `
VISA APPLICATION APPROVAL NOTICE

Case Reference: ${caseNum}
Applicant: ${name}
Decision: APPLICATION APPROVED

Dear ${name},

We are pleased to inform you that your visa application has been APPROVED.

Your visa will be valid for the period specified in your application. Please ensure you comply with all visa conditions and regulations during your stay.

NEXT STEPS:
• Collect your passport from the designated collection point
• Review the visa conditions carefully before travel
• Ensure you have adequate travel insurance

Issued by: Republic of Turkey - Ministry of Foreign Affairs
Date: ${new Date().toISOString().split('T')[0]}
    `.trim(),
    tr: (name: string, caseNum: string, _flags: string[]) => `
VİZE BAŞVURUSU ONAY KARARI

Dosya Referansı: ${caseNum}
Başvuru Sahibi: ${name}
Karar: BAŞVURU ONAYLANDI

Sayın ${name},

Vize başvurunuzun ONAYLANDIĞINI bildirmekten memnuniyet duyuyoruz.

Vizeniz başvurunuzda belirtilen süre için geçerli olacaktır. Kalış süreniz boyunca tüm vize koşullarına ve düzenlemelerine uymanızı rica ederiz.

SONRAKİ ADIMLAR:
• Pasaportunuzu belirlenen teslim noktasından alın
• Seyahatinizden önce vize koşullarını dikkatlice inceleyin
• Yeterli seyahat sigortanız olduğundan emin olun

Düzenleyen: Türkiye Cumhuriyeti Dışişleri Bakanlığı
Tarih: ${new Date().toISOString().split('T')[0]}
    `.trim()
  },
  escalate: {
    en: (name: string, caseNum: string, flags: string[]) => `
INTERNAL ESCALATION MEMO

Case Reference: ${caseNum}
Subject: ${name}
Status: ESCALATED FOR SUPERVISOR REVIEW

This case has been escalated for supervisor review due to the following concerns:

${flags.map((flag, i) => `${i + 1}. ${flag}`).join('\n')}

RECOMMENDED ACTION:
• Further investigation required before final decision
• Consider requesting additional documentation
• Verify cross-references with partner intelligence agencies

Escalation Priority: HIGH
Review Deadline: 48 hours

Escalated by: System / Reviewing Officer
Date: ${new Date().toISOString().split('T')[0]}
    `.trim(),
    tr: (name: string, caseNum: string, flags: string[]) => `
DAHİLİ ESKALİZAİON NOTU

Dosya Referansı: ${caseNum}
Konu: ${name}
Durum: AMİR İNCELEMESİ İÇİN ESKALİZE EDİLDİ

Bu dosya aşağıdaki endişeler nedeniyle amir incelemesine sevk edilmiştir:

${flags.map((flag, i) => `${i + 1}. ${flag}`).join('\n')}

ÖNERİLEN EYLEM:
• Nihai karar öncesi daha fazla inceleme gereklidir
• Ek belge talep edilmesi düşünülmelidir
• Ortak istihbarat birimleriyle çapraz kontrol yapılmalıdır

Eskalizasyon Önceliği: YÜKSEK
İnceleme Son Tarihi: 48 saat

Eskalize Eden: Sistem / İnceleme Memuru
Tarih: ${new Date().toISOString().split('T')[0]}
    `.trim()
  }
};

const DEMO_FLAGS = [
  'Connection to known visa mill network (Apex Travel Agency cluster)',
  'Document hash match with template used in 8 prior applications',
  'Pre-submission signal: Shared mobile number with 3 other applicants (Source: vizesepetim.com)'
];

export function AutoDecisionJustification({ 
  decisionType, 
  applicantName, 
  caseNumber, 
  riskScore,
  flags = DEMO_FLAGS 
}: JustificationProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const template = TEMPLATES[decisionType][language];
  const generatedText = template(applicantName, caseNumber, flags);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    toast.success('Justification copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      setRegenerating(false);
      toast.success('Justification regenerated');
    }, 800);
  };

  const getDecisionColor = () => {
    switch (decisionType) {
      case 'approve': return 'text-accent';
      case 'reject': return 'text-destructive';
      case 'escalate': return 'text-yellow-500';
    }
  };

  const getDecisionLabel = () => {
    switch (decisionType) {
      case 'approve': return 'Approval';
      case 'reject': return 'Rejection';
      case 'escalate': return 'Escalation';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className={`w-4 h-4 ${getDecisionColor()}`} />
          <h4 className="font-semibold text-sm">
            Auto-Generated {getDecisionLabel()} Justification
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Languages className="w-4 h-4" />
                {language === 'en' ? 'English' : 'Türkçe'}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('tr')}>
                Türkçe
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Generated Text */}
      <div className="relative">
        <div className="p-4 bg-secondary/30 rounded-lg border border-border font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-80 overflow-auto">
          {generatedText}
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-accent" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Text
              </>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Audit Note */}
      <p className="text-[10px] text-muted-foreground">
        This justification was auto-generated based on {flags.length} identified risk flags and will be logged in the audit trail upon case closure.
      </p>
    </div>
  );
}
