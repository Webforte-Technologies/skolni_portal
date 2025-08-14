import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  defaultKey: string;
  currentKey: string;
  category: 'general' | 'chat' | 'navigation' | 'accessibility';
}

// Browser-reserved shortcuts that cannot be overridden
const BROWSER_RESERVED_SHORTCUTS = [
  'Ctrl+Shift+I',    // Developer Tools
  'Ctrl+Shift+J',    // Console
  'Ctrl+Shift+C',    // Element Inspector
  'Ctrl+Shift+E',    // Network
  'Ctrl+Shift+M',    // Device Toggle
  'F12',             // Developer Tools
  'Ctrl+U',          // View Source
  'Ctrl+Shift+U',    // View Source
  'Ctrl+R',          // Refresh
  'F5',              // Refresh
  'Ctrl+F5',         // Hard Refresh
  'Ctrl+Shift+R',    // Hard Refresh
  'Ctrl+Shift+Delete', // Clear Data
  'Ctrl+Shift+N',    // New Incognito Window
  'Ctrl+Shift+P',    // New Private Window
  'Ctrl+T',          // New Tab
  'Ctrl+Shift+T',    // Reopen Closed Tab
  'Ctrl+W',          // Close Tab
  'Ctrl+Shift+W',    // Close Window
  'Ctrl+Tab',        // Next Tab
  'Ctrl+Shift+Tab',  // Previous Tab
  'Ctrl+1-9',        // Switch to Tab Number
  'Ctrl+Shift+1-9',  // Switch to Tab Number
  'Alt+Left',        // Back
  'Alt+Right',       // Forward
  'Ctrl+L',          // Focus Address Bar
  'Ctrl+K',          // Focus Search Bar
  'Ctrl+E',          // Focus Search Bar
  'Ctrl+Shift+Delete', // Clear Browsing Data
  'Ctrl+Shift+Escape', // Task Manager
  'Ctrl+Shift+Esc',  // Task Manager
  'Ctrl+Alt+Delete', // System Menu
  'Ctrl+Shift+Z',    // Redo (some browsers)
  'Ctrl+Y',          // Redo (some browsers)
];

export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  onShortcutAction: (shortcutId: string) => void
) => {
  const normalizeKey = useCallback((event: KeyboardEvent): string => {
    const modifiers: string[] = [];
    
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');
    if (event.metaKey) modifiers.push('Cmd');
    
    let key = event.key;
    
    // Handle special keys and normalize to uppercase for single letters
    if (key === ' ') key = 'Space';
    else if (key === 'Enter') key = 'Enter';
    else if (key === 'Escape') key = 'Escape';
    else if (key === 'Tab') key = 'Tab';
    else if (key === 'Backspace') key = 'Backspace';
    else if (key === 'Delete') key = 'Delete';
    else if (key.startsWith('Arrow')) key = key; // Keep ArrowUp, ArrowDown etc.
    else if (key.startsWith('F') && key.length <= 3) key = key; // Keep F1, F12 etc.
    else if (['Home', 'End', 'PageUp', 'PageDown', 'Insert'].includes(key)) key = key;
    // If it's a modifier key itself (e.g., user just pressed 'Control' without another key)
    else if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
      // Don't add modifier key as a regular key if it's already in modifiers
      // But allow modifier-only combinations if multiple modifiers are pressed
      if (modifiers.length > 1) {
        return modifiers.join('+');
      }
      return ''; // Return empty string for single modifier press
    }
    else if (key.length === 1) key = key.toUpperCase(); // For 'a' to 'A'
    
    const resultParts = [...modifiers, key].filter(Boolean); // Filter out empty string if key was a modifier
    const result = resultParts.join('+');
    
    if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
      console.log(`🔑 Normalized key: ${result} (original: ${event.key}, ctrl: ${event.ctrlKey}, shift: ${event.shiftKey}, alt: ${event.altKey}, meta: ${event.metaKey})`);
    }
    return result;
  }, []);

  const isBrowserReserved = useCallback((key: string): boolean => {
    return BROWSER_RESERVED_SHORTCUTS.some(reserved => {
      // Check exact match
      if (reserved === key) return true;
      
      // Check pattern matches (e.g., Ctrl+1-9)
      if (reserved.includes('1-9')) {
        const base = reserved.replace('1-9', '');
        for (let i = 1; i <= 9; i++) {
          if (key === base + i) return true;
        }
      }
      
      return false;
    });
  }, []);

  const executeShortcut = useCallback((shortcutId: string) => {
    if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
      console.log(`🎯 Executing shortcut: ${shortcutId}`);
    }
    
    // Call the callback for all shortcuts - let individual pages handle their own logic
    onShortcutAction(shortcutId);
  }, [onShortcutAction]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't handle shortcuts in input fields, contenteditable, or when typing
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement).contentEditable === 'true' ||
      (event.target as HTMLElement).tagName === 'INPUT' ||
      (event.target as HTMLElement).tagName === 'TEXTAREA'
    ) {
      if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
        console.log(`🚫 Skipping shortcut in input element: ${(event.target as HTMLElement).tagName}`);
      }
      return;
    }

    const pressedKey = normalizeKey(event);
    if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
      console.log(`⌨️ Key pressed: ${pressedKey}`);
      console.log(`⌨️ Event details: key=${event.key}, ctrl=${event.ctrlKey}, shift=${event.shiftKey}, alt=${event.altKey}, meta=${event.metaKey}`);
      console.log(`⌨️ Available shortcuts:`, shortcuts.map(s => `${s.id}: ${s.currentKey}`));
    }

    // Check if this is a browser-reserved shortcut
    if (isBrowserReserved(pressedKey)) {
      if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
        console.log(`⚠️ Browser-reserved shortcut detected: ${pressedKey}`);
      }
      // Still try to prevent it, but it may not work
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Find matching shortcut
    const shortcut = shortcuts.find(s => s.currentKey === pressedKey);
    
    if (shortcut) {
      if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
        console.log(`✅ Shortcut matched: ${shortcut.id} (${shortcut.name})`);
      }
      
      // Aggressively prevent default behavior and propagation
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      
      // Execute the shortcut
      executeShortcut(shortcut.id);
    } else {
      if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
        console.log(`❌ No shortcut found for: ${pressedKey}`);
      }
    }
  }, [shortcuts, normalizeKey, isBrowserReserved, executeShortcut]);

  useEffect(() => {
    // Use capture phase to intercept events before they reach the browser
    document.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown]);

  // Return function to manually check if a key is browser-reserved
  const checkIfBrowserReserved = useCallback((key: string): boolean => {
    return isBrowserReserved(key);
  }, [isBrowserReserved]);

  return { checkIfBrowserReserved };
};
