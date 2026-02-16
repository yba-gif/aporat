import { useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom';
}

const tourSteps: TourStep[] = [
  { target: 'hero', title: 'HUDA Nedir?', description: 'Yerel secimler icin yapay zeka destekli kampanya istihbarat platformu. Tum kampanya sureclerini tek panelden yonetin.', position: 'bottom' },
  { target: 'problem', title: 'Mevcut Sorunlar', description: 'Turkiye\'de kampanya araclari daginik ve manuel. HUDA bu sorunu butunlesik bir platformla cozuyor.', position: 'bottom' },
  { target: 'solution', title: '4 Ana Modul', description: 'Secmen Istihbarati, Erisim Motoru, Saha Operasyonlari ve Analitik Paneli. Her biri kampanyanin farkli bir boyutunu yonetiyor.', position: 'bottom' },
  { target: 'scenario', title: 'Canli Senaryo', description: 'Kadikoy ilcesinde gercekci bir kampanya senaryosunu adim adim izleyin. "Otomatik Oynat" butonuna basin.', position: 'top' },
  { target: 'mockups', title: 'Interaktif Demo', description: 'Grafiklere tiklayin, mesaj gonderin, saha ekiplerini inceleyin. Platformun gercek kullanim deneyimini yasayin.', position: 'top' },
  { target: 'comparison', title: 'Fark Nerede?', description: 'Manuel kampanyalarla HUDA arasindaki farki tek tabloda gorun.', position: 'top' },
];

export function HudaTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleStart = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      const el = document.querySelector(`[data-tour="${tourSteps[currentStep + 1].target}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setIsOpen(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const el = document.querySelector(`[data-tour="${tourSteps[currentStep - 1].target}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Floating launch button */}
      {!isOpen && (
        <button
          onClick={handleStart}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 transition-all duration-300 hover:scale-105"
        >
          <Lightbulb className="w-4 h-4" />
          <span className="text-sm font-medium">Rehberli Tur</span>
        </button>
      )}

      {/* Tour overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          {/* Semi-transparent backdrop */}
          <div className="absolute inset-0 bg-foreground/40 pointer-events-auto" onClick={() => setIsOpen(false)} />

          {/* Tour card - fixed at bottom */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg pointer-events-auto animate-fade-up">
            <div className="mx-4 bg-card border border-border shadow-2xl">
              {/* Progress bar */}
              <div className="h-1 bg-muted">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-accent font-mono mb-1">
                      {currentStep + 1} / {tourSteps.length}
                    </p>
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {step.description}
                </p>

                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Onceki
                  </button>
                  <div className="flex gap-1">
                    {tourSteps.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${i === currentStep ? 'bg-accent' : i < currentStep ? 'bg-accent/40' : 'bg-border'}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                  >
                    {currentStep === tourSteps.length - 1 ? 'Bitir' : 'Sonraki'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
