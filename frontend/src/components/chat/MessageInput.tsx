import React, { useState, useCallback, useRef, useImperativeHandle } from 'react';
import { Send, Loader2, CornerDownLeft, FilePlus2, Wand2 } from 'lucide-react';
import Button from '../ui/Button';

export interface MessageInputHandle {
  focus: () => void;
  insertText: (text: string) => void;
}

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

const MessageInput = React.memo(React.forwardRef<MessageInputHandle, MessageInputProps>(({ onSendMessage, isLoading = false, disabled = false, disabledReason }, ref) => {
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState(3);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setRows(3);
      textareaRef.current?.focus();
    }
  }, [message, isLoading, disabled, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-950">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                // simple auto-grow up to 7 lines
                const lineBreaks = (e.target.value.match(/\n/g) || []).length + 1;
                const next = Math.min(7, Math.max(3, lineBreaks));
                setRows(next);
              }}
              onKeyPress={handleKeyPress}
              placeholder="Napište svůj dotaz..."
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-lg shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none pr-12"
              rows={rows}
              disabled={isLoading || disabled}
            />
            <div className="absolute right-3 bottom-3 text-xs text-neutral-400 flex items-center space-x-1">
              <CornerDownLeft className="h-3 w-3" />
              <span>Send</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <Wand2 className="h-3 w-3" />
            <span>Tip: Shift+Enter = nový řádek • Ctrl/Cmd+K (coming soon)</span>
          </div>
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          className="flex items-center space-x-2"
          title={disabled ? (disabledReason || 'Odeslání je dočasně nedostupné') : undefined}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span>Odeslat</span>
        </Button>
      </form>
    </div>
  );
}));

MessageInput.displayName = 'MessageInput';

export default MessageInput; 