export function KeyboardShortcutHints() {
  return (
    <div className="text-[10px] text-muted-foreground space-y-1">
      <div className="flex items-center justify-between gap-4">
        <span>Switch modules</span>
        <kbd className="px-1.5 py-0.5 bg-secondary rounded font-mono">⌘1/2/3</kbd>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span>Search</span>
        <kbd className="px-1.5 py-0.5 bg-secondary rounded font-mono">⌘K</kbd>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span>Toggle entity</span>
        <kbd className="px-1.5 py-0.5 bg-secondary rounded font-mono">⌘E</kbd>
      </div>
    </div>
  );
}
