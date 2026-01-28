import { useState, useMemo } from 'react';
import { 
  Calendar, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface TimelineEvent {
  date: string;
  count: number;
  flaggedCount: number;
  nodeIds: string[];
}

interface TimelineScrubberProps {
  nodes: any[];
  onTimeChange: (visibleNodeIds: string[] | null) => void;
}

export function TimelineScrubber({ nodes, onTimeChange }: TimelineScrubberProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState([100]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate timeline data from nodes
  const timelineData = useMemo(() => {
    const events: TimelineEvent[] = [];
    const now = new Date('2026-01-28');
    
    // Simulate submission dates based on node IDs
    for (let i = 0; i < 14; i++) {
      const date = new Date(now.getTime() - (13 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Distribute nodes across dates based on patterns
      const dayNodes = nodes.filter((n, idx) => {
        const nodeDay = idx % 14;
        return nodeDay === i;
      });
      
      const flaggedNodes = dayNodes.filter(n => n.flagged);
      
      events.push({
        date: dateStr,
        count: dayNodes.length,
        flaggedCount: flaggedNodes.length,
        nodeIds: dayNodes.map(n => n.id)
      });
    }
    
    return events;
  }, [nodes]);

  // Calculate visible nodes based on position
  const visibleNodesUpToPosition = useMemo(() => {
    const position = currentPosition[0];
    const cutoffIndex = Math.floor((position / 100) * timelineData.length);
    
    if (position >= 100) return null; // Show all
    
    const visibleIds: string[] = [];
    for (let i = 0; i <= cutoffIndex; i++) {
      visibleIds.push(...timelineData[i].nodeIds);
    }
    return visibleIds;
  }, [currentPosition, timelineData]);

  const handlePositionChange = (value: number[]) => {
    setCurrentPosition(value);
    const position = value[0];
    const cutoffIndex = Math.floor((position / 100) * timelineData.length);
    
    if (position >= 100) {
      onTimeChange(null); // Show all
    } else {
      const visibleIds: string[] = [];
      for (let i = 0; i <= cutoffIndex; i++) {
        if (timelineData[i]) {
          visibleIds.push(...timelineData[i].nodeIds);
        }
      }
      onTimeChange(visibleIds);
    }
  };

  const playTimeline = () => {
    setIsPlaying(true);
    setCurrentPosition([0]);
    
    let pos = 0;
    const interval = setInterval(() => {
      pos += 5;
      if (pos > 100) {
        pos = 100;
        setIsPlaying(false);
        clearInterval(interval);
      }
      setCurrentPosition([pos]);
      handlePositionChange([pos]);
    }, 200);
  };

  const getCurrentDate = () => {
    const position = currentPosition[0];
    const idx = Math.floor((position / 100) * (timelineData.length - 1));
    return timelineData[idx]?.date || timelineData[timelineData.length - 1]?.date;
  };

  const totalFlagged = timelineData.reduce((sum, e) => sum + e.flaggedCount, 0);
  const maxDailyCount = Math.max(...timelineData.map(e => e.count));

  return (
    <div className={`absolute bottom-20 left-4 right-40 z-10 transition-all ${
      isExpanded ? 'bg-surface-elevated border border-border rounded-lg p-4' : ''
    }`}>
      {isExpanded ? (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Timeline Scrubber</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">{getCurrentDate()}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(false)}>
                <span className="text-xs">×</span>
              </Button>
            </div>
          </div>

          {/* Histogram */}
          <div className="flex items-end gap-[2px] h-12">
            {timelineData.map((event, idx) => {
              const height = (event.count / maxDailyCount) * 100;
              const position = currentPosition[0];
              const isActive = idx <= (position / 100) * timelineData.length;
              
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-0.5"
                  title={`${event.date}: ${event.count} applications (${event.flaggedCount} flagged)`}
                >
                  <div 
                    className={`w-full rounded-t transition-all ${
                      isActive 
                        ? event.flaggedCount > 0 ? 'bg-destructive' : 'bg-accent' 
                        : 'bg-secondary'
                    }`}
                    style={{ height: `${height}%`, minHeight: event.count > 0 ? '4px' : '0' }}
                  />
                </div>
              );
            })}
          </div>

          {/* Slider */}
          <Slider
            value={currentPosition}
            onValueChange={handlePositionChange}
            max={100}
            step={1}
            className="w-full"
          />

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePositionChange([0])}>
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={isPlaying ? () => setIsPlaying(false) : playTimeline}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePositionChange([100])}>
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-muted-foreground">{nodes.length} total</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span className="text-muted-foreground">{totalFlagged} flagged</span>
              </div>
            </div>
          </div>

          {/* Coordination Alert */}
          {timelineData.some(e => e.count > 5) && (
            <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Coordination pattern detected: 12 applications from same agency within 48 hours</span>
            </div>
          )}
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-surface-elevated"
          onClick={() => setIsExpanded(true)}
        >
          <Clock className="w-4 h-4" />
          Timeline
        </Button>
      )}
    </div>
  );
}
