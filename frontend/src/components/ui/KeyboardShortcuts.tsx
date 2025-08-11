import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Card from './Card';
import { KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
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
  'Ctrl+Shift+F5',   // Hard Refresh
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

// Suggested alternative shortcuts
const SUGGESTED_ALTERNATIVES = {
  'Ctrl+T': ['Ctrl+Shift+T', 'Ctrl+Alt+T', 'Ctrl+Shift+1'],
  'Ctrl+R': ['Ctrl+Shift+R', 'Ctrl+Alt+R', 'F5'],
  'Ctrl+F5': ['Ctrl+Shift+F5', 'Ctrl+Alt+F5', 'Shift+F5'],
  'Ctrl+U': ['Ctrl+Shift+U', 'Ctrl+Alt+U', 'Ctrl+Shift+S'],
  'Ctrl+K': ['Ctrl+Shift+K', 'Ctrl+Alt+K', 'Ctrl+Shift+L'],
  'Ctrl+L': ['Ctrl+Shift+L', 'Ctrl+Alt+L', 'Ctrl+Shift+O'],
  'Ctrl+E': ['Ctrl+Shift+E', 'Ctrl+Alt+E', 'Ctrl+Shift+D'],
  'F12': ['Ctrl+Shift+F12', 'Ctrl+Alt+F12', 'Shift+F12'],
  'Ctrl+1-9': ['Ctrl+Shift+1-9', 'Ctrl+Alt+1-9', 'Alt+1-9'],
  'Ctrl+Shift+1-9': ['Ctrl+Alt+1-9', 'Alt+Shift+1-9', 'F1-F9'],
};

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([
    { id: 'new-chat', name: 'Nový chat', description: 'Vytvořit novou konverzaci', defaultKey: 'Ctrl+N', currentKey: 'Ctrl+N', category: 'chat' },
    { id: 'focus-composer', name: 'Zaměřit kompozitor', description: 'Přesunout kurzor do vstupního pole', defaultKey: 'Ctrl+L', currentKey: 'Ctrl+L', category: 'chat' },
    { id: 'send-message', name: 'Odeslat zprávu', description: 'Odeslat zprávu v chatu', defaultKey: 'Ctrl+Enter', currentKey: 'Ctrl+Enter', category: 'chat' },
    { id: 'help', name: 'Nápověda', description: 'Otevřít nápovědu', defaultKey: 'F1', currentKey: 'F1', category: 'general' },
    { id: 'shortcuts', name: 'Klávesové zkratky', description: 'Otevřít nastavení zkratek', defaultKey: 'Ctrl+/', currentKey: 'Ctrl+/', category: 'general' },
    { id: 'toggle-theme', name: 'Přepnout téma', description: 'Přepnout mezi světlým a tmavým režim', defaultKey: 'Ctrl+T', currentKey: 'Ctrl+T', category: 'general' },
    { id: 'high-contrast', name: 'Vysoký kontrast', description: 'Přepnout vysoký kontrast', defaultKey: 'Ctrl+H', currentKey: 'Ctrl+H', category: 'accessibility' }
  ]);

  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [recordingKey, setRecordingKey] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [conflicts, setConflicts] = useState<Record<string, string[]>>({});
  const [showBrowserWarning, setShowBrowserWarning] = useState(false);
  const [waitingForMoreKeys, setWaitingForMoreKeys] = useState(false);

  // Check for browser-reserved shortcuts on load
  useEffect(() => {
    const browserReserved = shortcuts.filter(s => 
      BROWSER_RESERVED_SHORTCUTS.includes(s.currentKey)
    );
    
    if (browserReserved.length > 0) {
      setShowBrowserWarning(true);
    }
  }, [shortcuts]);

  // Load saved shortcuts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customShortcuts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setShortcuts(parsed);
      } catch (error) {
        console.error('Failed to parse saved shortcuts:', error);
      }
    }
  }, []);

  // Save shortcuts to localStorage whenever they change
  useEffect(() => {
    if (shortcuts.length > 0) {
      localStorage.setItem('customShortcuts', JSON.stringify(shortcuts));
    }
  }, [shortcuts]);

  // Global listener for shortcut feedback
  useEffect(() => {
    const handleGlobalShortcut = (event: KeyboardEvent) => {
      const keys: string[] = [];
      if (event.ctrlKey) keys.push('Ctrl');
      if (event.altKey) keys.push('Alt');
      if (event.shiftKey) keys.push('Shift');
      if (event.metaKey) keys.push('Cmd');
      
      if (event.key !== 'Control' && event.key !== 'Shift' && event.key !== 'Alt' && event.key !== 'Meta') {
        keys.push(event.key.toUpperCase());
      }
      
      const pressedKey = keys.join('+');
      const matchingShortcut = shortcuts.find(s => s.currentKey === pressedKey);
      
      if (matchingShortcut) {
        // Show feedback that the shortcut was detected
        setTestResults(prev => ({ ...prev, [matchingShortcut.id]: true }));
        setTimeout(() => {
          setTestResults(prev => ({ ...prev, [matchingShortcut.id]: false }));
        }, 1000);
      }
    };
    
    document.addEventListener('keydown', handleGlobalShortcut);
    return () => document.removeEventListener('keydown', handleGlobalShortcut);
  }, [shortcuts]);

  // Handle key press events for recording shortcuts
  useEffect(() => {
    if (editingShortcut && recordingKey) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (editingShortcut === recordingKey) {
          handleKeyPress(event as any);
        }
      };
      
      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [editingShortcut, recordingKey]);

  const checkForConflicts = () => {
    const newConflicts: Record<string, string[]> = {};
    
    shortcuts.forEach(shortcut => {
      const duplicates = shortcuts.filter(s => 
        s.id !== shortcut.id && s.currentKey === shortcut.currentKey
      );
      
      if (duplicates.length > 0) {
        newConflicts[shortcut.id] = duplicates.map(d => d.name);
      }
    });
    
    setConflicts(newConflicts);
  };

  useEffect(() => {
    checkForConflicts();
  }, [shortcuts]);

  const handleEditShortcut = (shortcutId: string) => {
    setEditingShortcut(shortcutId);
    setRecordingKey(shortcutId);
  };

  const handleCancelEdit = () => {
    setEditingShortcut(null);
    setRecordingKey(null);
    setWaitingForMoreKeys(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (editingShortcut !== recordingKey) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const modifiers: string[] = [];
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');
    if (event.metaKey) modifiers.push('Cmd');
    
    let mainKey = event.key;
    
    // Don't add modifier keys as regular keys, but allow modifier-only combinations
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(mainKey)) {
      // If it's just a modifier key press, check if we have multiple modifiers
      if (modifiers.length > 1) {
        const modifierOnlyKey = modifiers.join('+');
        console.log(`🎹 Recording modifier-only shortcut: ${modifierOnlyKey}`);
        
        // Check if this is a browser-reserved shortcut
        if (BROWSER_RESERVED_SHORTCUTS.includes(modifierOnlyKey)) {
          alert(`⚠️ Tato klávesová zkratka (${modifierOnlyKey}) je rezervována prohlížečem a nelze ji přepsat. Zkuste jinou kombinaci.`);
          return;
        }
        
        setShortcuts(prev => prev.map(s => 
          s.id === editingShortcut ? { ...s, currentKey: modifierOnlyKey } : s
        ));
        
        setEditingShortcut(null);
        setRecordingKey(null);
        setWaitingForMoreKeys(false); // Clear waiting state
        return;
      }
      
      // Single modifier press - wait for more keys
      console.log(`🎹 Waiting for more keys... (current modifiers: ${modifiers.join(', ')})`);
      setWaitingForMoreKeys(true);
      return;
    }
    
    // Normalize the main key
    if (mainKey === ' ') mainKey = 'Space';
    else if (mainKey === 'Enter') mainKey = 'Enter';
    else if (mainKey === 'Escape') mainKey = 'Escape';
    else if (mainKey === 'Tab') mainKey = 'Tab';
    else if (mainKey === 'Backspace') mainKey = 'Backspace';
    else if (mainKey === 'Delete') mainKey = 'Delete';
    else if (mainKey.startsWith('Arrow')) mainKey = mainKey; // Keep ArrowUp, ArrowDown etc.
    else if (mainKey.startsWith('F') && mainKey.length <= 3) mainKey = mainKey; // Keep F1, F12 etc.
    else if (['Home', 'End', 'PageUp', 'PageDown', 'Insert'].includes(mainKey)) mainKey = mainKey;
    else if (mainKey.length === 1) mainKey = mainKey.toUpperCase(); // For 'a' to 'A'
    
    const newKeyParts = [...modifiers, mainKey].filter(Boolean);
    const newKey = newKeyParts.join('+');
    
    if (newKey === '') {
      console.log('Skipping empty key combination (only modifier pressed)');
      return;
    }
    
    console.log(`🎹 Recording shortcut: ${newKey} (modifiers: ${modifiers.join(', ')}, mainKey: ${mainKey})`);
    
    // Check if this is a browser-reserved shortcut
    const isBrowserReserved = BROWSER_RESERVED_SHORTCUTS.includes(newKey);
    
    if (isBrowserReserved) {
      alert(`⚠️ Tato klávesová zkratka (${newKey}) je rezervována prohlížečem a nelze ji přepsat. Zkuste jinou kombinaci.`);
      return;
    }
    
    setShortcuts(prev => prev.map(s => 
      s.id === editingShortcut ? { ...s, currentKey: newKey } : s
    ));
    
    setEditingShortcut(null);
    setRecordingKey(null);
    setWaitingForMoreKeys(false); // Clear waiting state
    
    // Test the new shortcut
    if (editingShortcut) {
      setTestResults(prev => ({ ...prev, [editingShortcut]: true }));
    }
    
    // Shortcuts are automatically saved by useEffect
  };

  const handleReset = () => {
    setShortcuts(prev => prev.map(s => ({ ...s, currentKey: s.defaultKey })));
    localStorage.removeItem('customShortcuts');
    setTestResults({});
    setConflicts({});
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(shortcuts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'keyboard-shortcuts.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string);
            setShortcuts(imported);
            // Shortcuts are automatically saved by useEffect
          } catch (error) {
            alert('Chyba při načítání souboru. Zkontrolujte, že je to platný JSON soubor.');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  };

  const getAlternativeSuggestions = (shortcut: string): string[] => {
    return SUGGESTED_ALTERNATIVES[shortcut as keyof typeof SUGGESTED_ALTERNATIVES] || [];
  };

  const isBrowserReserved = (shortcut: string): boolean => {
    return BROWSER_RESERVED_SHORTCUTS.includes(shortcut);
  };

  const getShortcutStatus = (shortcut: KeyboardShortcut) => {
    if (isBrowserReserved(shortcut.currentKey)) {
      return { status: 'browser-reserved', text: 'Rezervováno prohlížečem', color: 'text-red-600' };
    }
    if (shortcut.currentKey !== shortcut.defaultKey) {
      return { status: 'custom', text: 'Vlastní', color: 'text-blue-600' };
    }
    return { status: 'default', text: 'Výchozí', color: 'text-gray-600' };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Klávesové zkratky">
      <div className="space-y-6">
        {/* Browser Warning */}
        {showBrowserWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Některé zkratky jsou rezervovány prohlížečem
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Následující zkratky nelze přepsat, protože je používá prohlížeč:</p>
                  <ul className="mt-1 list-disc list-inside">
                    {shortcuts.filter(s => isBrowserReserved(s.currentKey)).map(s => (
                      <li key={s.id}>
                        <strong>{s.name}</strong> ({s.currentKey}) - {s.description}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2">Doporučujeme změnit tyto zkratky na alternativní kombinace.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shortcuts List */}
        <div className="space-y-4">
          {shortcuts.map((shortcut) => {
            const status = getShortcutStatus(shortcut);
            const alternatives = getAlternativeSuggestions(shortcut.currentKey);
            
            return (
              <Card key={shortcut.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900">{shortcut.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${status.color} bg-gray-100`}>
                        {status.text}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{shortcut.description}</p>
                    
                    {/* Browser Reserved Warning */}
                    {isBrowserReserved(shortcut.currentKey) && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        <p className="font-medium">⚠️ Tato zkratka je rezervována prohlížečem!</p>
                        {alternatives.length > 0 && (
                          <p className="mt-1">
                            Doporučené alternativy: {alternatives.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm font-mono bg-gray-100 px-3 py-1 rounded border">
                        {shortcut.currentKey}
                      </div>
                      {shortcut.currentKey !== shortcut.defaultKey && (
                        <div className="text-xs text-gray-500 mt-1">
                          Výchozí: {shortcut.defaultKey}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditShortcut(shortcut.id)}
                        disabled={editingShortcut === shortcut.id}
                      >
                        {editingShortcut === shortcut.id ? 'Upravuji...' : 'Upravit'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTestResults(prev => ({ ...prev, [shortcut.id]: true }));
                          setTimeout(() => setTestResults(prev => ({ ...prev, [shortcut.id]: false })), 1000);
                        }}
                      >
                        ▶
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Recording Indicator */}
                {editingShortcut === shortcut.id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-red-700 font-medium">
                        {waitingForMoreKeys 
                          ? 'Čekám na další klávesy... Stiskněte další klávesu pro dokončení kombinace'
                          : 'Nahrávání klávesové zkratky... Stiskněte požadovanou kombinaci kláves'
                        }
                      </span>
                    </div>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        Zrušit
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Test Result */}
                {testResults[shortcut.id] && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    ✅ Zkratka byla úspěšně testována!
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Conflicts Warning */}
        {Object.keys(conflicts).length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              ⚠️ Detekovány konflikty zkratek
            </h3>
            <div className="space-y-2">
              {Object.entries(conflicts).map(([shortcutId, conflicts]) => {
                const shortcut = shortcuts.find(s => s.id === shortcutId);
                return (
                  <div key={shortcutId} className="text-sm text-yellow-700">
                    <strong>{shortcut?.name}</strong> má stejnou zkratku jako: {conflicts.join(', ')}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleReset}>
              Obnovit výchozí
            </Button>
            <Button variant="outline" onClick={handleExport}>
              Exportovat
            </Button>
            <div className="relative">
              <Button variant="outline" onClick={handleImport}>
                Importovat
              </Button>
            </div>
          </div>
          
          <Button onClick={onClose}>
            Zavřít
          </Button>
        </div>

        {/* Troubleshooting Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Řešení problémů</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Problém:</strong> Zkratky nefungují v prohlížeči</p>
            <p><strong>Řešení:</strong> Některé kombinace kláves (např. Ctrl+T, Ctrl+R, F12) jsou rezervovány prohlížečem a nelze je přepsat. Použijte alternativní kombinace.</p>
            
            <p><strong>Problém:</strong> Zkratky nefungují v textových polích</p>
            <p><strong>Řešení:</strong> Zkratky jsou automaticky deaktivovány v input polích, textarea a contenteditable elementech.</p>
            
            <p><strong>Problém:</strong> Zkratky se neregistrují</p>
            <p><strong>Řešení:</strong> Zkuste obnovit stránku nebo zkontrolovat, zda nemáte aktivní jiné aplikace, které zachytávají klávesové zkratky.</p>
          </div>
        </div>

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 rounded-lg p-4 text-xs font-mono">
            <h3 className="font-medium mb-2">Debug Info</h3>
            <div>editingShortcut: {editingShortcut || 'null'}</div>
            <div>recordingKey: {recordingKey || 'null'}</div>
            <div>waitingForMoreKeys: {waitingForMoreKeys ? 'true' : 'false'}</div>
            <div>Total shortcuts: {shortcuts.length}</div>
            <div>localStorage: {localStorage.getItem('customShortcuts') ? 'OK' : 'Empty'}</div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default KeyboardShortcuts;
