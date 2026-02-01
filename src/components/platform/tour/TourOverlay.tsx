import { useEffect, useState } from 'react';
import { useTour } from '@/contexts/TourContext';
import { TourTooltip } from './TourTooltip';

export function TourOverlay() {
  const { isActive, spotlightRect, updateSpotlightRect } = useTour();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      updateSpotlightRect();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', updateSpotlightRect);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updateSpotlightRect);
    };
  }, [isActive, updateSpotlightRect]);

  if (!isActive) return null;

  const padding = 8;
  const borderRadius = 8;

  // Create clip path for spotlight effect
  const getClipPath = () => {
    if (!spotlightRect) {
      return 'none';
    }

    const { width, height } = windowSize;
    const x = spotlightRect.left - padding;
    const y = spotlightRect.top - padding;
    const w = spotlightRect.width + padding * 2;
    const h = spotlightRect.height + padding * 2;

    // Create a path that covers everything except the spotlight area
    return `polygon(
      0% 0%, 
      0% 100%, 
      ${x}px 100%, 
      ${x}px ${y}px, 
      ${x + w}px ${y}px, 
      ${x + w}px ${y + h}px, 
      ${x}px ${y + h}px, 
      ${x}px 100%, 
      100% 100%, 
      100% 0%
    )`;
  };

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          clipPath: getClipPath(),
          transition: 'clip-path 0.3s ease-out',
        }}
      />

      {/* Spotlight border highlight */}
      {spotlightRect && (
        <div
          className="fixed z-[9998] pointer-events-none border-2 border-accent shadow-[0_0_0_4px_rgba(var(--accent),0.3)]"
          style={{
            left: spotlightRect.left - padding,
            top: spotlightRect.top - padding,
            width: spotlightRect.width + padding * 2,
            height: spotlightRect.height + padding * 2,
            borderRadius,
            transition: 'all 0.3s ease-out',
          }}
        />
      )}

      {/* Click blocker for non-spotlight areas */}
      <div
        className="fixed inset-0 z-[9997]"
        style={{
          pointerEvents: spotlightRect ? 'none' : 'auto',
        }}
      />

      {/* Tour tooltip */}
      <TourTooltip />
    </>
  );
}
