import React, { useCallback } from 'react';
import { ChatMessage } from '../../types';
import { cn } from '../../utils/cn';
import { User, Bot, Copy, Check } from 'lucide-react';
import Button from '../ui/Button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MessageProps {
  message: ChatMessage;
  onCopyMessage?: (messageId: string, content: string) => void;
  copiedMessageId?: string | null;
}

const Message: React.FC<MessageProps> = React.memo(({ message, onCopyMessage, copiedMessageId }) => {
  const isUser = message.isUser;
  const isCopied = copiedMessageId === message.id;

  const handleCopy = useCallback(() => {
    if (onCopyMessage) {
      onCopyMessage(message.id, message.content);
    }
  }, [onCopyMessage, message.id, message.content]);

  return (
    <div className={cn(
      'flex items-start space-x-3 mb-4 animate-slide-up',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center shadow-soft">
            <Bot className="h-6 w-6 text-white" />
          </div>
        </div>
      )}
      
      <div className={cn(
        'max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-lg relative group',
        isUser 
          ? 'bg-primary-600 text-white' 
          : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
      )}>
        <div className="text-sm leading-relaxed markdown-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ inline, className, children, ...props }) {
                const code = String(children);
                if (inline) {
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[0.85em]" {...props}>
                      {code}
                    </code>
                  );
                }
                return (
                  <pre className="bg-neutral-100 dark:bg-neutral-900 rounded-md p-3 overflow-x-auto text-[0.85em]">
                    <code className={className} {...props}>{code}</code>
                  </pre>
                );
              },
              a({ children, ...props }) {
                return (
                  <a className="text-primary-600 hover:underline" target="_blank" rel="noreferrer" {...props}>
                    {children}
                  </a>
                );
              },
              ul({ children }) {
                return <ul className="list-disc pl-5 space-y-1">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-5 space-y-1">{children}</ol>;
              },
              p({ children }) {
                return <p className="whitespace-pre-wrap">{children}</p>;
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        
        {/* Copy button for AI messages */}
        {!isUser && onCopyMessage && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="h-6 w-6 p-0 bg-white bg-opacity-90 hover:bg-opacity-100"
            >
              {isCopied ? (
                <Check className="h-3 w-3 text-success-600" />
              ) : (
                <Copy className="h-3 w-3 text-neutral-600" />
              )}
            </Button>
          </div>
        )}
        
        {/* Timestamp */}
        <div className={cn(
          'text-xs mt-2',
          isUser ? 'text-primary-100' : 'text-neutral-500 dark:text-neutral-400'
        )}>
          {new Date(message.timestamp).toLocaleTimeString('cs-CZ', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-neutral-600 rounded-full flex items-center justify-center shadow-soft">
            <User className="h-6 w-6 text-white" />
          </div>
        </div>
      )}
    </div>
  );
});

Message.displayName = 'Message';

export default Message; 