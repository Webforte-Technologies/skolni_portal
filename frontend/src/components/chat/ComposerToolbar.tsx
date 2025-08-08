import React from 'react';
import Button from '../ui/Button';
import { Paperclip, Wand2, FileText } from 'lucide-react';

interface ComposerToolbarProps {
  onUpload?: () => void;
  onTemplates?: () => void;
  onGenerateWorksheet?: () => void;
  disabled?: boolean;
}

const ComposerToolbar: React.FC<ComposerToolbarProps> = ({ onUpload, onTemplates, onGenerateWorksheet, disabled }) => {
  return (
    <div className="flex items-center gap-2 px-1 pt-2 text-xs text-neutral-500 dark:text-neutral-400">
      <Button variant="ghost" size="icon" disabled={disabled} onClick={onUpload} title="Nahrát soubor (coming soon)">
        <Paperclip className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" disabled={disabled} onClick={onTemplates} title="Šablony / příkazy (coming soon)">
        <Wand2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" disabled={disabled} onClick={onGenerateWorksheet} title="Vygenerovat cvičení">
        <FileText className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ComposerToolbar;


