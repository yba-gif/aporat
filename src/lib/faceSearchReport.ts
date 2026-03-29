import type jsPDFType from 'jspdf';

interface ReportData {
  subjectName: string | null;
  totalMatches: number;
  bestScore: number;
  testingMode: boolean;
  searchDate: string;
  platforms: { platform: string; icon: string; count: number; avgScore: number }[];
  accounts: { platform: string; username: string; bestScore: number; postCount: number; profileUrl: string }[];
  results: { url: string; score: number }[];
  narrative: {
    executiveSummary: string;
    keyFindings: string[];
    riskAssessment: string;
    platformAnalysis: string;
    accountCorrelation: string;
    recommendations: string[];
    confidenceNote: string;
    osintEnrichment?: { tool: string; purpose: string; priority: string }[];
    digitalFootprint?: string;
  };
  searchImageBase64?: string;
  enrichment?: {
    enriched: boolean;
    extractedName?: string | null;
    nameConfidence?: string;
    bio?: string | null;
    location?: string | null;
    occupation?: string | null;
    organization?: string | null;
    website?: string | null;
    profileDetails?: { platform: string; username: string; displayName?: string; bio?: string; followers?: string }[];
    crossReferenceNotes?: string;
    scrapedCount?: number;
  } | null;
  usernameEnum?: {
    success: boolean;
    totalPlatformsChecked?: number;
    results?: {
      username: string;
      totalFound: number;
      platforms?: { platform: string; url: string; category?: string }[];
    }[];
  } | null;
  telegramOsint?: {
    totalFound?: number;
    results?: {
      username: string;
      exists: boolean;
      displayName?: string;
      bio?: string;
      profileType?: string;
      memberCount?: number;
    }[];
    aiAnalysis?: {
      intelligenceNotes?: string;
      riskIndicators?: string[];
    };
  } | null;
  breachData?: {
    breachesFound: boolean;
    totalBreaches: number;
    breaches?: {
      name: string;
      date?: string;
      dataExposed?: string[];
      severity?: string;
      description?: string;
      affectedIdentifier?: string;
    }[];
    riskSummary?: string;
    recommendations?: string[];
  } | null;
}

const COLORS = {
  black: [15, 15, 20] as [number, number, number],
  darkGray: [40, 40, 48] as [number, number, number],
  midGray: [100, 100, 110] as [number, number, number],
  lightGray: [180, 180, 188] as [number, number, number],
  paleGray: [235, 235, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  accent: [120, 80, 220] as [number, number, number],
  red: [200, 60, 60] as [number, number, number],
  amber: [200, 150, 30] as [number, number, number],
  green: [50, 160, 80] as [number, number, number],
};

function riskColor(score: number): [number, number, number] {
  if (score >= 80) return COLORS.red;
  if (score >= 60) return COLORS.amber;
  return COLORS.green;
}

function riskLabel(score: number): string {
  if (score >= 90) return 'CRITICAL';
  if (score >= 80) return 'HIGH';
  if (score >= 60) return 'MEDIUM';
  return 'LOW';
}

export async function generateFaceSearchReport(data: ReportData): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const H = 297;
  const ML = 20; // margin left
  const MR = 20;
  const CW = W - ML - MR; // content width
  let y = 0;

  const reportId = `FSR-${Date.now().toString(36).toUpperCase()}`;
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  // ─── COVER PAGE ─────────────────────────────────────────
  // Dark header band
  doc.setFillColor(...COLORS.black);
  doc.rect(0, 0, W, 80, 'F');

  // Thin accent line
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 80, W, 1.5, 'F');

  // Classification strip
  doc.setFillColor(...COLORS.red);
  doc.rect(0, 0, W, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.white);
  doc.text(data.testingMode ? 'DEMONSTRATION / TEST DATA' : 'CLASSIFIED // INTELLIGENCE PRODUCT', W / 2, 5.5, { align: 'center' });

  // Title block
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.lightGray);
  doc.text('FACIAL RECOGNITION', ML, 28);
  doc.setFontSize(26);
  doc.setTextColor(...COLORS.white);
  doc.text('Intelligence Report', ML, 42);

  // Subject name
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.accent);
  doc.text(`Subject: ${data.subjectName || 'Unknown Subject'}`, ML, 56);

  // Meta line
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.midGray);
  doc.text(`${reportId}  |  ${timestamp}  |  ${data.totalMatches} matches  |  Best: ${data.bestScore}%`, ML, 66);

  // Overview metrics boxes
  y = 92;
  const boxW = (CW - 9) / 4;
  const metrics = [
    { label: 'TOTAL MATCHES', value: String(data.totalMatches) },
    { label: 'BEST SCORE', value: `${data.bestScore}%` },
    { label: 'PLATFORMS', value: String(data.platforms.length) },
    { label: 'ACCOUNTS', value: String(data.accounts.length) },
  ];
  metrics.forEach((m, i) => {
    const x = ML + i * (boxW + 3);
    doc.setFillColor(...COLORS.paleGray);
    doc.roundedRect(x, y, boxW, 22, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.midGray);
    doc.text(m.label, x + boxW / 2, y + 8, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.black);
    doc.text(m.value, x + boxW / 2, y + 18, { align: 'center' });
  });

  // Risk indicator
  y = 122;
  const overallRisk = riskLabel(data.bestScore);
  const rc = riskColor(data.bestScore);
  doc.setFillColor(...rc);
  doc.roundedRect(ML, y, CW, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.white);
  doc.text(`EXPOSURE RISK LEVEL: ${overallRisk}`, W / 2, y + 9, { align: 'center' });

  // ─── SUBJECT PROFILE (from Firecrawl enrichment) ─────────
  if (data.enrichment?.enriched) {
    y = 148;
    y = sectionHeader(doc, 'VERIFIED SUBJECT PROFILE', ML, y);

    // Profile info grid
    const e = data.enrichment;
    const profileFields: [string, string][] = [];
    if (e.extractedName) profileFields.push(['Full Name', e.extractedName]);
    if (e.nameConfidence) profileFields.push(['Name Confidence', e.nameConfidence]);
    if (e.occupation) profileFields.push(['Occupation', e.occupation]);
    if (e.organization) profileFields.push(['Organization', e.organization]);
    if (e.location) profileFields.push(['Location', e.location]);
    if (e.website) profileFields.push(['Website', e.website]);

    if (profileFields.length > 0) {
      const colW = CW / 2;
      profileFields.forEach((field, i) => {
        const col = i % 2;
        const xPos = ML + col * colW;
        if (i > 0 && col === 0) y += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.midGray);
        doc.text(field[0].toUpperCase(), xPos, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.black);
        doc.text(field[1], xPos, y + 4.5);
      });
      y += 14;
    }

    if (e.bio) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.midGray);
      doc.text('BIO', ML, y);
      y += 4;
      y = wrappedText(doc, e.bio, ML, y, CW, 8.5, COLORS.darkGray);
      y += 4;
    }

    if (e.crossReferenceNotes) {
      doc.setFillColor(248, 248, 252);
      doc.roundedRect(ML, y, CW, 14, 2, 2, 'F');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.midGray);
      const noteLines = doc.splitTextToSize(`Cross-reference: ${e.crossReferenceNotes}`, CW - 8);
      doc.text(noteLines, ML + 4, y + 5);
      y += Math.max(14, noteLines.length * 4 + 6);
      y += 4;
    }

    // Scraped profile details table
    if (e.profileDetails && e.profileDetails.length > 0) {
      y = checkPageBreak(doc, y, 30);
      autoTable(doc, {
        startY: y,
        margin: { left: ML, right: MR },
        head: [['Platform', 'Username', 'Display Name', 'Bio', 'Followers']],
        body: e.profileDetails.map(p => [
          p.platform || '-',
          p.username ? `@${p.username}` : '-',
          p.displayName || '-',
          (p.bio || '-').slice(0, 80),
          p.followers || '-',
        ]),
        theme: 'plain',
        styles: {
          fontSize: 7,
          cellPadding: 2.5,
          textColor: COLORS.darkGray,
          lineWidth: 0.2,
          lineColor: COLORS.paleGray,
        },
        headStyles: {
          fillColor: COLORS.accent,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 6.5,
        },
        alternateRowStyles: { fillColor: [248, 248, 252] },
        columnStyles: {
          3: { cellWidth: 50, fontSize: 6.5 },
        },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }
  } else {
    y = 148;
  }

  // ─── EXECUTIVE SUMMARY ──────────────────────────────────
  y = checkPageBreak(doc, y, 40);
  y = sectionHeader(doc, 'EXECUTIVE SUMMARY', ML, y);
  y = wrappedText(doc, data.narrative.executiveSummary, ML, y, CW, 9, COLORS.darkGray);
  y += 6;

  // ─── KEY FINDINGS ───────────────────────────────────────
  y = checkPageBreak(doc, y, 60);
  y = sectionHeader(doc, 'KEY FINDINGS', ML, y);
  data.narrative.keyFindings.forEach((finding, i) => {
    y = checkPageBreak(doc, y, 12);
    doc.setFillColor(...COLORS.accent);
    doc.circle(ML + 2.5, y + 2.5, 1.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.white);
    doc.text(String(i + 1), ML + 2.5, y + 3.5, { align: 'center' });
    const lines = doc.splitTextToSize(finding, CW - 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.darkGray);
    doc.text(lines, ML + 8, y + 3.5);
    y += lines.length * 4.5 + 3;
  });
  y += 4;

  // ─── RISK ASSESSMENT ────────────────────────────────────
  y = checkPageBreak(doc, y, 40);
  y = sectionHeader(doc, 'RISK ASSESSMENT', ML, y);
  doc.setFillColor(rc[0], rc[1], rc[2]);
  doc.setDrawColor(...rc);
  doc.setFillColor(rc[0], rc[1], rc[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(ML, y, CW, 20, 2, 2, 'S');
  doc.setFillColor(248, 248, 252);
  doc.roundedRect(ML + 0.3, y + 0.3, CW - 0.6, 19.4, 1.8, 1.8, 'F');
  y = wrappedText(doc, data.narrative.riskAssessment, ML + 4, y + 5, CW - 8, 9, COLORS.darkGray);
  y += 10;

  // ─── PLATFORM ANALYSIS ──────────────────────────────────
  y = checkPageBreak(doc, y, 50);
  y = sectionHeader(doc, 'PLATFORM ANALYSIS', ML, y);
  y = wrappedText(doc, data.narrative.platformAnalysis, ML, y, CW, 9, COLORS.darkGray);
  y += 4;

  // Platform table
  if (data.platforms.length > 0) {
    y = checkPageBreak(doc, y, 30);
    autoTable(doc, {
      startY: y,
      margin: { left: ML, right: MR },
      head: [['Platform', 'Matches', 'Avg Confidence', 'Signal']],
      body: data.platforms.map(p => [
        p.platform,
        String(p.count),
        `${p.avgScore}%`,
        p.avgScore >= 80 ? 'HIGH' : p.avgScore >= 60 ? 'MEDIUM' : 'LOW',
      ]),
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: COLORS.darkGray,
        lineWidth: 0.2,
        lineColor: COLORS.paleGray,
      },
      headStyles: {
        fillColor: COLORS.black,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 7,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 252],
      },
      columnStyles: {
        3: {
          fontStyle: 'bold',
        },
      },
      didParseCell: (hookData: any) => {
        if (hookData.column.index === 3 && hookData.section === 'body') {
          const val = hookData.cell.raw;
          if (val === 'HIGH') hookData.cell.styles.textColor = COLORS.red;
          else if (val === 'MEDIUM') hookData.cell.styles.textColor = COLORS.amber;
          else hookData.cell.styles.textColor = COLORS.green;
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ─── ACCOUNT CORRELATION ────────────────────────────────
  y = checkPageBreak(doc, y, 50);
  y = sectionHeader(doc, 'IDENTIFIED ACCOUNTS', ML, y);
  y = wrappedText(doc, data.narrative.accountCorrelation, ML, y, CW, 9, COLORS.darkGray);
  y += 4;

  if (data.accounts.length > 0) {
    y = checkPageBreak(doc, y, 30);
    autoTable(doc, {
      startY: y,
      margin: { left: ML, right: MR },
      head: [['Platform', 'Username', 'Confidence', 'Images', 'Profile URL']],
      body: data.accounts.slice(0, 30).map(a => [
        a.platform,
        `@${a.username}`,
        `${a.bestScore}%`,
        String(a.postCount),
        a.profileUrl,
      ]),
      theme: 'plain',
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        textColor: COLORS.darkGray,
        lineWidth: 0.2,
        lineColor: COLORS.paleGray,
      },
      headStyles: {
        fillColor: COLORS.black,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 7,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 252],
      },
      columnStyles: {
        2: { fontStyle: 'bold' },
        4: { fontSize: 6.5, textColor: COLORS.midGray },
      },
      didParseCell: (hookData: any) => {
        if (hookData.column.index === 2 && hookData.section === 'body') {
          const score = parseInt(hookData.cell.raw);
          if (score >= 80) hookData.cell.styles.textColor = COLORS.red;
          else if (score >= 60) hookData.cell.styles.textColor = COLORS.amber;
          else hookData.cell.styles.textColor = COLORS.green;
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ─── RECOMMENDATIONS ────────────────────────────────────
  y = checkPageBreak(doc, y, 50);
  y = sectionHeader(doc, 'RECOMMENDATIONS', ML, y);
  data.narrative.recommendations.forEach((rec, i) => {
    y = checkPageBreak(doc, y, 12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.accent);
    doc.text(`${String(i + 1).padStart(2, '0')}`, ML, y + 3.5);
    const lines = doc.splitTextToSize(rec, CW - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.darkGray);
    doc.text(lines, ML + 10, y + 3.5);
    y += lines.length * 4.5 + 3;
  });
  y += 4;

  // ─── DIGITAL FOOTPRINT ──────────────────────────────────
  if (data.narrative.digitalFootprint) {
    y = checkPageBreak(doc, y, 30);
    y = sectionHeader(doc, 'DIGITAL FOOTPRINT ASSESSMENT', ML, y);
    y = wrappedText(doc, data.narrative.digitalFootprint, ML, y, CW, 9, COLORS.darkGray);
    y += 6;
  }

  // ─── USERNAME ENUMERATION ─────────────────────────────────
  if (data.usernameEnum?.success && data.usernameEnum.results && data.usernameEnum.results.length > 0) {
    y = checkPageBreak(doc, y, 50);
    y = sectionHeader(doc, 'USERNAME ENUMERATION (300+ PLATFORMS)', ML, y);

    const totalFound = data.usernameEnum.results.reduce((sum, r) => sum + r.totalFound, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.midGray);
    doc.text(`Checked ${data.usernameEnum.totalPlatformsChecked || 0} platforms | Found ${totalFound} matching accounts`, ML, y);
    y += 6;

    // Build flat table of all found platforms
    const enumRows: string[][] = [];
    for (const result of data.usernameEnum.results) {
      if (result.platforms) {
        for (const p of result.platforms.slice(0, 40)) {
          enumRows.push([
            `@${result.username}`,
            p.platform,
            p.category || '-',
            p.url,
          ]);
        }
      }
    }

    if (enumRows.length > 0) {
      y = checkPageBreak(doc, y, 30);
      autoTable(doc, {
        startY: y,
        margin: { left: ML, right: MR },
        head: [['Username', 'Platform', 'Category', 'URL']],
        body: enumRows.slice(0, 60),
        theme: 'plain',
        styles: {
          fontSize: 6.5,
          cellPadding: 2,
          textColor: COLORS.darkGray,
          lineWidth: 0.2,
          lineColor: COLORS.paleGray,
        },
        headStyles: {
          fillColor: COLORS.black,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 6.5,
        },
        alternateRowStyles: { fillColor: [248, 248, 252] },
        columnStyles: {
          0: { cellWidth: 28, fontStyle: 'bold' },
          1: { cellWidth: 30 },
          2: { cellWidth: 22 },
          3: { fontSize: 5.5, textColor: COLORS.midGray },
        },
      });
      y = (doc as any).lastAutoTable.finalY + 8;

      if (enumRows.length > 60) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.midGray);
        doc.text(`+ ${enumRows.length - 60} additional accounts not shown`, ML, y);
        y += 6;
      }
    }
  }

  // ─── TELEGRAM INTELLIGENCE ────────────────────────────────
  if (data.telegramOsint && data.telegramOsint.totalFound && data.telegramOsint.totalFound > 0) {
    y = checkPageBreak(doc, y, 50);
    y = sectionHeader(doc, 'TELEGRAM INTELLIGENCE', ML, y);

    const foundProfiles = data.telegramOsint.results?.filter(r => r.exists) || [];

    for (const profile of foundProfiles) {
      y = checkPageBreak(doc, y, 20);
      // Profile header
      doc.setFillColor(0, 136, 204);
      doc.roundedRect(ML, y, CW, 5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.white);
      doc.text(`@${profile.username}  |  ${(profile.profileType || 'user').toUpperCase()}${profile.memberCount ? `  |  ${profile.memberCount} members` : ''}`, ML + 3, y + 3.5);
      y += 8;

      if (profile.displayName) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...COLORS.black);
        doc.text(profile.displayName, ML, y);
        y += 5;
      }
      if (profile.bio) {
        y = wrappedText(doc, profile.bio, ML, y, CW, 8, COLORS.darkGray);
        y += 2;
      }
      y += 3;
    }

    if (data.telegramOsint.aiAnalysis?.intelligenceNotes) {
      y = checkPageBreak(doc, y, 20);
      doc.setFillColor(248, 248, 252);
      doc.roundedRect(ML, y, CW, 4, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.midGray);
      doc.text('AI ANALYSIS', ML + 3, y + 3);
      y += 7;
      y = wrappedText(doc, data.telegramOsint.aiAnalysis.intelligenceNotes, ML, y, CW, 8, COLORS.darkGray);
      y += 2;

      if (data.telegramOsint.aiAnalysis.riskIndicators && data.telegramOsint.aiAnalysis.riskIndicators.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.red);
        doc.text('Risk Indicators: ' + data.telegramOsint.aiAnalysis.riskIndicators.join(' | '), ML, y);
        y += 5;
      }
    }
    y += 4;
  }

  // ─── BREACH INTELLIGENCE ──────────────────────────────────
  if (data.breachData) {
    y = checkPageBreak(doc, y, 50);
    y = sectionHeader(doc, 'BREACH INTELLIGENCE', ML, y);

    if (data.breachData.breachesFound && data.breachData.breaches && data.breachData.breaches.length > 0) {
      // Summary bar
      const breachColor = data.breachData.totalBreaches >= 3 ? COLORS.red : data.breachData.totalBreaches >= 1 ? COLORS.amber : COLORS.green;
      doc.setFillColor(...breachColor);
      doc.roundedRect(ML, y, CW, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.white);
      doc.text(`${data.breachData.totalBreaches} DATA BREACH${data.breachData.totalBreaches !== 1 ? 'ES' : ''} DETECTED`, W / 2, y + 6.5, { align: 'center' });
      y += 14;

      // Breach table
      autoTable(doc, {
        startY: y,
        margin: { left: ML, right: MR },
        head: [['Breach', 'Date', 'Severity', 'Data Exposed', 'Description']],
        body: data.breachData.breaches.map(b => [
          b.name,
          b.date || 'Unknown',
          (b.severity || 'unknown').toUpperCase(),
          (b.dataExposed || []).join(', ') || '-',
          (b.description || '-').slice(0, 100),
        ]),
        theme: 'plain',
        styles: {
          fontSize: 7,
          cellPadding: 2.5,
          textColor: COLORS.darkGray,
          lineWidth: 0.2,
          lineColor: COLORS.paleGray,
        },
        headStyles: {
          fillColor: COLORS.red,
          textColor: COLORS.white,
          fontStyle: 'bold',
          fontSize: 6.5,
        },
        alternateRowStyles: { fillColor: [252, 248, 248] },
        columnStyles: {
          0: { cellWidth: 28, fontStyle: 'bold' },
          2: { cellWidth: 18, fontStyle: 'bold' },
          4: { fontSize: 6.5 },
        },
        didParseCell: (hookData: any) => {
          if (hookData.column.index === 2 && hookData.section === 'body') {
            const val = hookData.cell.raw;
            if (val === 'CRITICAL' || val === 'HIGH') hookData.cell.styles.textColor = COLORS.red;
            else if (val === 'MEDIUM') hookData.cell.styles.textColor = COLORS.amber;
            else hookData.cell.styles.textColor = COLORS.green;
          }
        },
      });
      y = (doc as any).lastAutoTable.finalY + 6;
    } else {
      doc.setFillColor(...COLORS.green);
      doc.roundedRect(ML, y, CW, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.white);
      doc.text('NO KNOWN DATA BREACHES DETECTED', W / 2, y + 6.5, { align: 'center' });
      y += 14;
    }

    if (data.breachData.riskSummary) {
      y = checkPageBreak(doc, y, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.midGray);
      doc.text('RISK SUMMARY', ML, y);
      y += 4;
      y = wrappedText(doc, data.breachData.riskSummary, ML, y, CW, 8.5, COLORS.darkGray);
      y += 4;
    }

    if (data.breachData.recommendations && data.breachData.recommendations.length > 0) {
      y = checkPageBreak(doc, y, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.midGray);
      doc.text('BREACH RECOMMENDATIONS', ML, y);
      y += 4;
      for (const rec of data.breachData.recommendations) {
        y = checkPageBreak(doc, y, 8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.darkGray);
        doc.text(`• ${rec}`, ML + 2, y);
        y += 4.5;
      }
      y += 4;
    }
  }

  y = checkPageBreak(doc, y, 30);
  y = sectionHeader(doc, 'DATA CONFIDENCE', ML, y);
  y = wrappedText(doc, data.narrative.confidenceNote, ML, y, CW, 9, COLORS.midGray);
  y += 6;

  // ─── OSINT ENRICHMENT RECOMMENDATIONS ───────────────────
  if (data.narrative.osintEnrichment && data.narrative.osintEnrichment.length > 0) {
    y = checkPageBreak(doc, y, 50);
    y = sectionHeader(doc, 'RECOMMENDED OSINT ENRICHMENT', ML, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.midGray);
    doc.text('The following tools should be deployed to further investigate identified accounts and expand intelligence coverage.', ML, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      margin: { left: ML, right: MR },
      head: [['Priority', 'Tool', 'Purpose']],
      body: data.narrative.osintEnrichment.map(e => [
        e.priority,
        e.tool,
        e.purpose,
      ]),
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: COLORS.darkGray,
        lineWidth: 0.2,
        lineColor: COLORS.paleGray,
      },
      headStyles: {
        fillColor: COLORS.black,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 7,
      },
      columnStyles: {
        0: { cellWidth: 18, fontStyle: 'bold', halign: 'center' },
        1: { cellWidth: 30, fontStyle: 'bold' },
      },
      didParseCell: (hookData: any) => {
        if (hookData.column.index === 0 && hookData.section === 'body') {
          const val = hookData.cell.raw;
          if (val === 'HIGH') hookData.cell.styles.textColor = COLORS.red;
          else if (val === 'MEDIUM') hookData.cell.styles.textColor = COLORS.amber;
          else hookData.cell.styles.textColor = COLORS.green;
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ─── DATA APPENDIX (all URLs) ───────────────────────────
  if (data.results.length > 0) {
    doc.addPage();
    y = 20;
    y = sectionHeader(doc, 'DATA APPENDIX: ALL MATCHED URLS', ML, y);
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.midGray);
    doc.text(`${data.results.length} total matches ordered by confidence score`, ML, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      margin: { left: ML, right: MR },
      head: [['#', 'Score', 'URL']],
      body: data.results.slice(0, 100).map((r, i) => [
        String(i + 1),
        `${r.score}%`,
        r.url,
      ]),
      theme: 'plain',
      styles: {
        fontSize: 6.5,
        cellPadding: 2,
        textColor: COLORS.darkGray,
        lineWidth: 0.1,
        lineColor: COLORS.paleGray,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: COLORS.black,
        textColor: COLORS.white,
        fontStyle: 'bold',
        fontSize: 6.5,
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 14, fontStyle: 'bold', halign: 'center' },
        2: { cellWidth: CW - 22 - 4, fontSize: 6 },
      },
      didParseCell: (hookData: any) => {
        if (hookData.column.index === 1 && hookData.section === 'body') {
          const score = parseInt(hookData.cell.raw);
          if (score >= 80) hookData.cell.styles.textColor = COLORS.red;
          else if (score >= 60) hookData.cell.styles.textColor = COLORS.amber;
          else hookData.cell.styles.textColor = COLORS.green;
        }
      },
    });
  }

  // ─── Footer on all pages ────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Bottom line
    doc.setDrawColor(...COLORS.paleGray);
    doc.setLineWidth(0.3);
    doc.line(ML, H - 15, W - MR, H - 15);
    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.midGray);
    doc.text(`${reportId}  |  Generated ${timestamp}`, ML, H - 10);
    doc.text(`Page ${i} of ${pageCount}`, W - MR, H - 10, { align: 'right' });
    doc.setTextColor(...COLORS.lightGray);
    doc.text(data.testingMode ? 'DEMONSTRATION DATA' : 'CONFIDENTIAL INTELLIGENCE PRODUCT', W / 2, H - 10, { align: 'center' });
  }

  // Save
  const fileName = `Face_Intelligence_${(data.subjectName || 'Unknown').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

// ─── Helpers ──────────────────────────────────────────────

function sectionHeader(doc: jsPDFType, title: string, x: number, y: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.accent);
  doc.text(title, x, y);
  y += 2;
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.5);
  doc.line(x, y, x + 30, y);
  return y + 6;
}

function wrappedText(doc: jsPDFType, text: string, x: number, y: number, maxW: number, size: number, color: [number, number, number]): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines: string[] = doc.splitTextToSize(text || '', maxW);
  doc.text(lines, x, y);
  return y + lines.length * (size * 0.5) + 2;
}

function checkPageBreak(doc: jsPDFType, y: number, needed: number): number {
  if (y + needed > 275) {
    doc.addPage();
    return 20;
  }
  return y;
}