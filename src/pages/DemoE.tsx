import { useState } from 'react';
import { ArrowRight, Play, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const chapters = [
  { id: 1, time: '0:00', title: 'Platform Overview', duration: '2:15' },
  { id: 2, time: '2:15', title: 'Evidence Ingestion', duration: '3:42' },
  { id: 3, time: '5:57', title: 'Integrity Verification', duration: '4:18' },
  { id: 4, time: '10:15', title: 'Risk Scoring Engine', duration: '3:55' },
  { id: 5, time: '14:10', title: 'Workflow Configuration', duration: '4:22' },
  { id: 6, time: '18:32', title: 'Audit & Compliance', duration: '2:48' },
];

const keyTakeaways = [
  'Unified evidence layer eliminates data silos',
  'Real-time integrity checks with <200ms latency',
  'Explainable risk scores for audit compliance',
  'Configurable workflows without code changes',
  'Immutable audit trail for every decision',
];

export default function DemoE() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container-wide flex items-center justify-between h-16">
          <Link to="/" className="text-sm font-medium">
            ← Back to Home
          </Link>
          <span className="text-label">Demo Variant E</span>
        </div>
      </header>

      {/* Hero */}
      <section className="section-padding border-b border-border">
        <div className="container-wide">
          <p className="text-label mb-4">Executive Overview</p>
          <h1 className="text-display max-w-3xl mb-6">
            21 minutes to understand the platform.
          </h1>
          <p className="text-subhead max-w-2xl">
            A comprehensive walkthrough of Portolan Labs' compliance infrastructure—from evidence ingestion to audit-ready archive.
          </p>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20">
        <div className="container-wide">
          <div className="grid lg:grid-cols-[1fr_380px] gap-12">
            {/* Video Player */}
            <div>
              {/* Player Container */}
              <div 
                className="aspect-video bg-foreground relative cursor-pointer group"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-background flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-foreground ml-1" />
                    </div>
                  </div>
                )}

                {/* Simulated video content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-4 text-white">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 opacity-70" />
                      <span className="text-sm">21:20</span>
                    </div>
                    <div className="flex-1 h-1 bg-white/30">
                      <div 
                        className="h-full bg-accent"
                        style={{ width: `${((currentChapter - 1) / chapters.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Grid overlay for visual interest */}
                <div className="absolute inset-0 bg-grid opacity-10" />
              </div>

              {/* Chapter Navigation */}
              <div className="mt-8">
                <p className="text-label mb-4">Chapters</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => setCurrentChapter(chapter.id)}
                      className={`text-left p-4 border transition-colors ${
                        currentChapter === chapter.id
                          ? 'border-foreground bg-secondary'
                          : 'border-border hover:border-line-strong'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-mono text-xs text-muted-foreground">
                          {chapter.time}
                        </span>
                        {currentChapter > chapter.id && (
                          <CheckCircle className="w-3 h-3 text-accent" />
                        )}
                      </div>
                      <p className="text-sm font-medium line-clamp-1">{chapter.title}</p>
                      <p className="text-xs text-muted-foreground">{chapter.duration}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="sticky top-8 space-y-8">
                {/* Key Takeaways */}
                <div className="p-8 bg-surface-elevated border border-border">
                  <p className="text-label mb-6">Key Takeaways</p>
                  <div className="space-y-4">
                    {keyTakeaways.map((takeaway, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-accent-foreground">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-sm">{takeaway}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Card */}
                <div className="p-8 bg-foreground text-background">
                  <h3 className="text-xl font-semibold mb-3">
                    Ready for a personalized demo?
                  </h3>
                  <p className="text-sm opacity-70 mb-6">
                    Schedule a call with our team to see how Portolan Labs fits your specific use case.
                  </p>
                  <button className="w-full py-3 bg-background text-foreground text-sm font-medium flex items-center justify-center gap-2">
                    Schedule Demo
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Download Option */}
                <div className="p-6 border border-border">
                  <p className="text-sm font-medium mb-2">Prefer reading?</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Download the technical overview PDF.
                  </p>
                  <button className="text-sm font-medium link-underline">
                    Download PDF →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-padding border-t border-border">
        <div className="container-wide text-center">
          <h2 className="text-headline mb-4">Questions after watching?</h2>
          <p className="text-body max-w-lg mx-auto mb-8">
            Our team is ready to answer technical questions and discuss your specific requirements.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-foreground text-background font-medium inline-flex items-center gap-2">
              Request Demo
              <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-4 border border-border font-medium">
              View Documentation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
