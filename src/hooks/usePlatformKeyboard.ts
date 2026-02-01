import { useEffect, useCallback } from 'react';
import { usePlatform } from '@/contexts/PlatformContext';

interface KeyboardShortcutsOptions {
  onToggleEntityPanel?: () => void;
  onOpenSearch?: () => void;
}

export function usePlatformKeyboard(options: KeyboardShortcutsOptions = {}) {
  const { setActiveModule } = usePlatform();
  const { onToggleEntityPanel } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const isMod = event.metaKey || event.ctrlKey;

    // ⌘1 - Switch to Maris
    if (isMod && event.key === '1') {
      event.preventDefault();
      setActiveModule('maris');
      return;
    }

    // ⌘2 - Switch to Nautica
    if (isMod && event.key === '2') {
      event.preventDefault();
      setActiveModule('nautica');
      return;
    }

    // ⌘3 - Switch to Meridian
    if (isMod && event.key === '3') {
      event.preventDefault();
      setActiveModule('meridian');
      return;
    }

    // ⌘E - Toggle entity panel
    if (isMod && event.key === 'e') {
      event.preventDefault();
      onToggleEntityPanel?.();
      return;
    }

    // ⌘K - Open search (handled by UnifiedCommandPalette, but we can trigger it here)
    if (isMod && event.key === 'k') {
      // Let the UnifiedCommandPalette handle this
      return;
    }
  }, [setActiveModule, onToggleEntityPanel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
