import React, { useState, useCallback } from 'react';
import { Send, Loader2 } from 'lucide-react';
import Button from '../ui/Button';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = React.memo(({ onSendMessage, isLoading = false, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  }, [message, isLoading, disabled, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <div className="border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Napište svůj dotaz..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
            disabled={isLoading || disabled}
          />
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          className="flex items-center space-x-2"
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
});

MessageInput.displayName = 'MessageInput';

export default MessageInput; 