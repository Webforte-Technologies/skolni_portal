import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Command Palette (beta)" size="md">
      <div className="space-y-2">
        {actions.map((a, i) => (
          <Button key={i} variant="outline" className="w-full justify-start" onClick={() => { a.run(); onClose(); }}>
            {a.label}
          </Button>
        ))}
        <div className="mt-2 text-xs text-neutral-500">Zkratka: Ctrl/Cmd + K</div>
      </div>
    </Modal>
  );
};

export default CommandPalette;


