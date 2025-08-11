import React from 'react';
import Button from '../ui/Button';
import { Paperclip, Wand2, FileText, Bold, List, Sigma } from 'lucide-react';

interface ComposerToolbarProps {
  onUpload: () => void;
  onTemplates?: () => void;
  onGenerateWorksheet?: () => void;
  disabled?: boolean;
  onInsertText?: (text: string) => void;
  onOpenHelp?: () => void;
}

const ComposerToolbar: React.FC<ComposerToolbarProps> = ({ onUpload, onTemplates, onGenerateWorksheet, disabled, onInsertText, onOpenHelp }) => {
  return (
    <div className="flex items-center gap-2 px-1 pt-2 text-xs text-muted-foreground dark:text-neutral-400">
      <Button variant="ghost" size="icon" onClick={onUpload} title="Nahrát obrázek matematického problému">
        <Paperclip className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onTemplates} title="Šablony / příkazy">
        <Wand2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" disabled={disabled} onClick={onGenerateWorksheet} title="Vygenerovat cvičení">
        <FileText className="h-4 w-4" />
      </Button>
      <div className="mx-2 h-5 w-px bg-border dark:bg-neutral-700" />
      <Button variant="ghost" size="icon" onClick={() => onInsertText && onInsertText('**tučný text**')} title="Vložit tučný text">
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onInsertText && onInsertText('- položka seznamu')} title="Vložit položku seznamu">
        <List className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onInsertText && onInsertText('$$ a^2 + b^2 = c^2 $$')} title="Vložit vzorec (LaTeX)">
        <Sigma className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onOpenHelp} title="Zobrazit nápovědu a zkratky">
        Nápověda
      </Button>
    </div>
  );
};

export default ComposerToolbar;


