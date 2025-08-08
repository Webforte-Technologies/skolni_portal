import React from 'react';
import Button from '../ui/Button';
import { Paperclip, Wand2, FileText, Bold, List, Sigma } from 'lucide-react';

interface ComposerToolbarProps {
  onUpload?: () => void;
  onTemplates?: () => void;
  onGenerateWorksheet?: () => void;
  disabled?: boolean;
  onInsertText?: (text: string) => void;
  onOpenHelp?: () => void;
}

const ComposerToolbar: React.FC<ComposerToolbarProps> = ({ onUpload, onTemplates, onGenerateWorksheet, disabled, onInsertText, onOpenHelp }) => {
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
      <div className="mx-2 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />
      <Button variant="ghost" size="icon" disabled={disabled} onClick={() => onInsertText && onInsertText('**tučný text**')} title="Vložit tučný text">
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" disabled={disabled} onClick={() => onInsertText && onInsertText('- položka seznamu')} title="Vložit položku seznamu">
        <List className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" disabled={disabled} onClick={() => onInsertText && onInsertText('$$ a^2 + b^2 = c^2 $$')} title="Vložit vzorec (LaTeX)">
        <Sigma className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" disabled={disabled} onClick={onOpenHelp} title="Zobrazit nápovědu a zkratky">
        Nápověda
      </Button>
    </div>
  );
};

export default ComposerToolbar;


