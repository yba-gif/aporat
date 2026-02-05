import { useState } from 'react';
import { Calendar, Clock, Play, Pause } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { format, subDays, addDays } from 'date-fns';

interface TimeSliderProps {
  minDate: Date;
  maxDate: Date;
  currentRange: [Date, Date];
  onChange: (range: [Date, Date]) => void;
  onPlayPause?: () => void;
  isPlaying?: boolean;
}

export function TimeSlider({
  minDate,
  maxDate,
  currentRange,
  onChange,
  onPlayPause,
  isPlaying = false,
}: TimeSliderProps) {
  // Convert dates to slider values (0-100)
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const dateToValue = (date: Date): number => {
    const days = Math.ceil((date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.round((days / totalDays) * 100);
  };
  
  const valueToDate = (value: number): Date => {
    const days = Math.round((value / 100) * totalDays);
    return addDays(minDate, days);
  };

  const handleSliderChange = (values: number[]) => {
    const newRange: [Date, Date] = [
      valueToDate(values[0]),
      valueToDate(values[1]),
    ];
    onChange(newRange);
  };

  const sliderValues = [
    dateToValue(currentRange[0]),
    dateToValue(currentRange[1]),
  ];

  return (
    <div className="bg-surface-elevated border border-border rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">Temporal Filter</span>
        </div>
        {onPlayPause && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onPlayPause}
            className="h-7 w-7 p-0"
          >
            {isPlaying ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3" />
            )}
          </Button>
        )}
      </div>

      <Slider
        value={sliderValues}
        onValueChange={handleSliderChange}
        min={0}
        max={100}
        step={1}
        className="mb-2"
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{format(currentRange[0], 'MMM d, yyyy')}</span>
        </div>
        <span className="text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded">
          {Math.ceil((currentRange[1].getTime() - currentRange[0].getTime()) / (1000 * 60 * 60 * 24))} days
        </span>
        <div className="flex items-center gap-1">
          <span>{format(currentRange[1], 'MMM d, yyyy')}</span>
          <Calendar className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

// Compact inline version for filter panel
export function TimeSliderCompact({
  minDate,
  maxDate,
  currentRange,
  onChange,
}: Omit<TimeSliderProps, 'onPlayPause' | 'isPlaying'>) {
  const totalDays = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  const dateToValue = (date: Date): number => {
    const days = Math.ceil((date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.round((days / totalDays) * 100);
  };
  
  const valueToDate = (value: number): Date => {
    const days = Math.round((value / 100) * totalDays);
    return addDays(minDate, days);
  };

  const handleSliderChange = (values: number[]) => {
    const newRange: [Date, Date] = [
      valueToDate(values[0]),
      valueToDate(values[1]),
    ];
    onChange(newRange);
  };

  const sliderValues = [
    dateToValue(currentRange[0]),
    dateToValue(currentRange[1]),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Time Range
        </p>
        <span className="text-[10px] font-mono text-muted-foreground">
          {format(currentRange[0], 'MM/dd')} - {format(currentRange[1], 'MM/dd')}
        </span>
      </div>
      <Slider
        value={sliderValues}
        onValueChange={handleSliderChange}
        min={0}
        max={100}
        step={1}
        className="w-full"
      />
    </div>
  );
}
