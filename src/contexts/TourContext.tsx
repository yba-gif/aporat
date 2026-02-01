import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for spotlight
  module?: 'maris' | 'nautica' | 'meridian';
  entityId?: string;
  caseId?: string;
  documentId?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void; // Optional action to perform when step is shown
}

interface TourContextValue {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep | null;
  steps: TourStep[];
  totalSteps: number;
  
  startTour: (steps: TourStep[]) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  
  // Spotlight
  spotlightTarget: string | null;
  spotlightRect: DOMRect | null;
  updateSpotlightRect: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}

interface TourProviderProps {
  children: ReactNode;
  onModuleChange?: (module: 'maris' | 'nautica' | 'meridian') => void;
  onEntitySelect?: (entityId: string) => void;
  onCaseSelect?: (caseId: string) => void;
}

export function TourProvider({ 
  children, 
  onModuleChange,
  onEntitySelect,
  onCaseSelect 
}: TourProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  const currentStep = isActive && steps[currentStepIndex] ? steps[currentStepIndex] : null;
  const spotlightTarget = currentStep?.target || null;

  const updateSpotlightRect = useCallback(() => {
    if (!spotlightTarget) {
      setSpotlightRect(null);
      return;
    }
    
    const element = document.querySelector(spotlightTarget);
    if (element) {
      setSpotlightRect(element.getBoundingClientRect());
    } else {
      setSpotlightRect(null);
    }
  }, [spotlightTarget]);

  const executeStepAction = useCallback((step: TourStep) => {
    // Navigate to module if specified
    if (step.module && onModuleChange) {
      onModuleChange(step.module);
    }
    
    // Select entity if specified
    if (step.entityId && onEntitySelect) {
      onEntitySelect(step.entityId);
    }
    
    // Select case if specified
    if (step.caseId && onCaseSelect) {
      onCaseSelect(step.caseId);
    }
    
    // Run custom action
    if (step.action) {
      step.action();
    }
    
    // Update spotlight after a small delay for DOM updates
    setTimeout(updateSpotlightRect, 100);
  }, [onModuleChange, onEntitySelect, onCaseSelect, updateSpotlightRect]);

  const startTour = useCallback((tourSteps: TourStep[]) => {
    setSteps(tourSteps);
    setCurrentStepIndex(0);
    setIsActive(true);
    
    if (tourSteps[0]) {
      executeStepAction(tourSteps[0]);
    }
  }, [executeStepAction]);

  const endTour = useCallback(() => {
    setIsActive(false);
    setSteps([]);
    setCurrentStepIndex(0);
    setSpotlightRect(null);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      executeStepAction(steps[nextIndex]);
    } else {
      endTour();
    }
  }, [currentStepIndex, steps, executeStepAction, endTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      executeStepAction(steps[prevIndex]);
    }
  }, [currentStepIndex, steps, executeStepAction]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
      executeStepAction(steps[index]);
    }
  }, [steps, executeStepAction]);

  const value: TourContextValue = {
    isActive,
    currentStepIndex,
    currentStep,
    steps,
    totalSteps: steps.length,
    startTour,
    endTour,
    nextStep,
    prevStep,
    goToStep,
    spotlightTarget,
    spotlightRect,
    updateSpotlightRect,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
}
