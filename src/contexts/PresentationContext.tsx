import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface PresentationSlide {
  id: string;
  title: string;
  subtitle?: string;
  module?: 'maris' | 'nautica' | 'meridian';
  entityId?: string;
  caseId?: string;
  notes?: string; // Speaker notes
}

interface PresentationContextValue {
  // Presentation state
  isPresenting: boolean;
  isPaused: boolean;
  currentSlideIndex: number;
  slides: PresentationSlide[];
  currentSlide: PresentationSlide | null;
  
  // Controls
  startPresentation: (slides?: PresentationSlide[]) => void;
  endPresentation: () => void;
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (index: number) => void;
  togglePause: () => void;
  
  // UI settings
  showSpeakerNotes: boolean;
  toggleSpeakerNotes: () => void;
}

const PresentationContext = createContext<PresentationContextValue | null>(null);

export function usePresentation() {
  const context = useContext(PresentationContext);
  if (!context) {
    throw new Error('usePresentation must be used within a PresentationProvider');
  }
  return context;
}

// Default demo slides for Turkish MFA presentation
const DEFAULT_SLIDES: PresentationSlide[] = [
  {
    id: 'title',
    title: 'Portolan',
    subtitle: 'Sovereign Visa Fraud Intelligence',
    notes: 'Welcome the Turkish delegation. Emphasize data sovereignty and white-label capability.',
  },
  {
    id: 'nautica-overview',
    title: 'Intelligence Nexus',
    subtitle: 'Entity resolution and fraud network visualization',
    module: 'nautica',
    notes: 'Show the graph visualization. Highlight the 17 nodes and their interconnections.',
  },
  {
    id: 'ahmad-case',
    title: 'Case Study: Ahmad Rezaee',
    subtitle: 'Coordinated visa fraud ring detection',
    module: 'nautica',
    entityId: 'app-rezaee',
    notes: 'Click on Ahmad Rezaee node. Show risk score of 94 and connections to visa mill.',
  },
  {
    id: 'fraud-network',
    title: 'Network Analysis',
    subtitle: '7 applicants linked through shared employer addresses',
    module: 'nautica',
    notes: 'Zoom out to show the full fraud network. Highlight the pattern of document reuse.',
  },
  {
    id: 'maris-vault',
    title: 'Evidence Vault',
    subtitle: 'Cryptographic chain-of-custody for all documents',
    module: 'maris',
    notes: 'Switch to Maris. Show the document vault with 847 documents and SHA-256 hashing.',
  },
  {
    id: 'document-integrity',
    title: 'Tamper Detection',
    subtitle: 'Metadata anomalies and hash verification',
    module: 'maris',
    notes: 'Click on Integrity tab. Show the 4 active alerts including timestamp anomalies.',
  },
  {
    id: 'meridian-workflow',
    title: 'Policy Governance',
    subtitle: 'Auditable decision workflows with reason codes',
    module: 'meridian',
    notes: 'Switch to Meridian. Show the case management queue and escalation workflow.',
  },
  {
    id: 'decision-audit',
    title: 'Decision Trail',
    subtitle: 'Immutable audit log for compliance',
    module: 'meridian',
    caseId: 'case-001',
    notes: 'Show the decision workflow for Ahmad Rezaee case. Highlight the signed rejection.',
  },
  {
    id: 'deployment',
    title: 'Sovereign Deployment',
    subtitle: 'White-label on Turkish cloud infrastructure',
    notes: 'Discuss BTK/TÜBİTAK hosting options. Emphasize complete data sovereignty.',
  },
  {
    id: 'closing',
    title: 'Next Steps',
    subtitle: 'Pilot proposal for Turkish Foreign Ministry',
    notes: 'Propose 90-day pilot with 3 consulates. Discuss integration with existing systems.',
  },
];

interface PresentationProviderProps {
  children: ReactNode;
  onModuleChange?: (module: 'maris' | 'nautica' | 'meridian') => void;
  onEntitySelect?: (entityId: string) => void;
  onCaseSelect?: (caseId: string) => void;
}

export function PresentationProvider({ 
  children,
  onModuleChange,
  onEntitySelect,
  onCaseSelect,
}: PresentationProviderProps) {
  const [isPresenting, setIsPresenting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [slides, setSlides] = useState<PresentationSlide[]>(DEFAULT_SLIDES);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);

  const currentSlide = isPresenting && slides[currentSlideIndex] ? slides[currentSlideIndex] : null;

  // Apply slide actions when slide changes
  useEffect(() => {
    if (!currentSlide || isPaused) return;
    
    if (currentSlide.module && onModuleChange) {
      onModuleChange(currentSlide.module);
    }
    
    if (currentSlide.entityId && onEntitySelect) {
      onEntitySelect(currentSlide.entityId);
    }
    
    if (currentSlide.caseId && onCaseSelect) {
      onCaseSelect(currentSlide.caseId);
    }
  }, [currentSlide, isPaused, onModuleChange, onEntitySelect, onCaseSelect]);

  // Keyboard navigation
  useEffect(() => {
    if (!isPresenting) return;

    const handleKeydown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'Escape':
          e.preventDefault();
          endPresentation();
          break;
        case 'n':
          e.preventDefault();
          setShowSpeakerNotes(prev => !prev);
          break;
        case 'p':
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isPresenting, currentSlideIndex, slides.length]);

  const startPresentation = useCallback((customSlides?: PresentationSlide[]) => {
    if (customSlides) {
      setSlides(customSlides);
    }
    setCurrentSlideIndex(0);
    setIsPresenting(true);
    setIsPaused(false);
  }, []);

  const endPresentation = useCallback(() => {
    setIsPresenting(false);
    setIsPaused(false);
    setShowSpeakerNotes(false);
  }, []);

  const nextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  }, [currentSlideIndex, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  }, [currentSlideIndex]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
    }
  }, [slides.length]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const toggleSpeakerNotes = useCallback(() => {
    setShowSpeakerNotes(prev => !prev);
  }, []);

  const value: PresentationContextValue = {
    isPresenting,
    isPaused,
    currentSlideIndex,
    slides,
    currentSlide,
    startPresentation,
    endPresentation,
    nextSlide,
    prevSlide,
    goToSlide,
    togglePause,
    showSpeakerNotes,
    toggleSpeakerNotes,
  };

  return (
    <PresentationContext.Provider value={value}>
      {children}
    </PresentationContext.Provider>
  );
}
