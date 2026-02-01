import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompassLogo } from '@/components/CompassLogo';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AlternativeCommandCenter } from '@/components/alternatives/AlternativeCommandCenter';
import { AlternativeMinimalDashboard } from '@/components/alternatives/AlternativeMinimalDashboard';
import { AlternativeTimelineFocus } from '@/components/alternatives/AlternativeTimelineFocus';

export default function Alternatives() {
  const [activeVariant, setActiveVariant] = useState<string>('command');

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-surface-elevated">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <CompassLogo className="w-6 h-6" />
            <span className="font-semibold text-sm">Portolan Labs</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Platform Variants</span>
        </div>
        <Link to="/platform" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Main Platform
        </Link>
      </header>

      {/* Variant Selector */}
      <div className="border-b border-border bg-surface-elevated">
        <div className="container-wide py-4">
          <Tabs value={activeVariant} onValueChange={setActiveVariant}>
            <TabsList className="bg-secondary/50 p-1">
              <TabsTrigger value="command" className="data-[state=active]:bg-background">
                Command Center
              </TabsTrigger>
              <TabsTrigger value="minimal" className="data-[state=active]:bg-background">
                Minimal Dashboard
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-background">
                Timeline Focus
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-7.5rem)]">
        {activeVariant === 'command' && <AlternativeCommandCenter />}
        {activeVariant === 'minimal' && <AlternativeMinimalDashboard />}
        {activeVariant === 'timeline' && <AlternativeTimelineFocus />}
      </div>
    </div>
  );
}
