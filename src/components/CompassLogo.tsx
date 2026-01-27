import { forwardRef } from 'react';

interface CompassLogoProps {
  className?: string;
}

export const CompassLogo = forwardRef<SVGSVGElement, CompassLogoProps>(
  ({ className }, ref) => {
    return (
      <svg ref={ref} viewBox="0 0 100 100" fill="none" className={className}>
        {/* Outer circle */}
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" />
        
        {/* Cardinal directions (N, E, S, W) */}
        <path d="M50 5 L53 40 L50 45 L47 40 Z" fill="currentColor" />
        <path d="M95 50 L60 53 L55 50 L60 47 Z" fill="currentColor" />
        <path d="M50 95 L47 60 L50 55 L53 60 Z" fill="currentColor" />
        <path d="M5 50 L40 47 L45 50 L40 53 Z" fill="currentColor" />
        
        {/* Ordinal directions (NE, SE, SW, NW) */}
        <path d="M82 18 L58 42 L55 42 L58 38 Z" fill="currentColor" />
        <path d="M82 82 L58 58 L58 55 L62 58 Z" fill="currentColor" />
        <path d="M18 82 L42 58 L45 58 L42 62 Z" fill="currentColor" />
        <path d="M18 18 L42 42 L42 45 L38 42 Z" fill="currentColor" />
        
        {/* Center */}
        <circle cx="50" cy="50" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="50" cy="50" r="3" fill="currentColor" />
        
        {/* Outer arrows */}
        <path d="M50 8 L48 2 L52 2 Z" fill="currentColor" />
        <path d="M92 50 L98 48 L98 52 Z" fill="currentColor" />
        <path d="M50 92 L52 98 L48 98 Z" fill="currentColor" />
        <path d="M8 50 L2 52 L2 48 Z" fill="currentColor" />
      </svg>
    );
  }
);

CompassLogo.displayName = 'CompassLogo';
