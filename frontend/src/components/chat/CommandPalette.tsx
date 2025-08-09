import React, { useMemo, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { ChevronDown, ChevronUp, Command } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onGoMaterials: () => void;
  onAddCredits: () => void;
  onFocusComposer: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNewChat, onGoMaterials, onAddCredits, onFocusComposer }) => {
  const actions = [
    { label: 'Nový chat', run: onNewChat },
    { label: 'Moje materiály', run: onGoMaterials },
    { label: 'Přidat kredity', run: onAddCredits },
    { label: 'Fokus na editor zprávy', run: onFocusComposer },
  ];

  const allShortcuts = useMemo(() => ([
    { key: 'Ctrl/Cmd + K', description: 'Otevřít Command Palette' },
    { key: 'Enter', description: 'Odeslat zprávu (bez Shiftu)' },
    { key: 'Shift + Enter', description: 'Nový řádek v editoru' },
    { key: '/', description: 'Otevřít menu příkazů vepsáním do editoru' },
  ]), []);

  const slashCommands = useMemo(() => ([
    { cmd: '/kvadraticke-rovnice', desc: 'Vytvoř sadu příkladů na kvadratické rovnice' },
    { cmd: '/derivace', desc: 'Připrav cvičení na derivace s postupem' },
    { cmd: '/slovni-uloha', desc: 'Navrhni slovní úlohy pro 8. třídu' },
    { cmd: '/cviceni', desc: 'Generuj pracovní list na opakování' },
  ]), []);

  const [showHelp, setShowHelp] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Command Palette (beta)" size="md">
      <div className="space-y-2">
        {actions.map((a, i) => (
          <Button key={i} variant="outline" className="w-full justify-start" onClick={() => { a.run(); onClose(); }}>
            {a.label}
          </Button>
        ))}
        <button type="button" className="mt-2 inline-flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300 hover:underline" onClick={() => setShowHelp(v => !v)}>
          <Command className="h-3.5 w-3.5" /> Všechny příkazy a zkratky {showHelp ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {showHelp && (
          <div className="mt-2 rounded-md border border-neutral-200 dark:border-neutral-800 p-3 text-sm">
            <div className="font-medium mb-1">Zkratky</div>
            <ul className="mb-2 space-y-1">
              {allShortcuts.map((s, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-neutral-600 dark:text-neutral-300">{s.description}</span>
                  <span className="ml-4 rounded bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-xs">{s.key}</span>
                </li>
              ))}
            </ul>
            <div className="font-medium mb-1">Slash příkazy</div>
            <ul className="space-y-1">
              {slashCommands.map((c, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="font-mono">{c.cmd}</span>
                  <span className="ml-4 text-neutral-600 dark:text-neutral-300">{c.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-2 text-xs text-neutral-500">Zkratka: Ctrl/Cmd + K</div>
      </div>
    </Modal>
  );
};

export default CommandPalette;


