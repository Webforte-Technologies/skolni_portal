import React, { useCallback, useMemo, useState } from 'react';
import { ChatMessage } from '../../types';
import { cn } from '../../utils/cn';
import { User, Bot, Copy, Check, BookOpen, ExternalLink } from 'lucide-react';
import Button from '../ui/Button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MessageProps {
  message: ChatMessage;
  onCopyMessage?: (messageId: string, content: string) => void;
  copiedMessageId?: string | null;
  onDeleteMessage?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  showLeftAvatar?: boolean;
  showRightAvatar?: boolean;
}

const Message: React.FC<MessageProps> = React.memo(({ message, onCopyMessage, copiedMessageId, onDeleteMessage, onRegenerate, showLeftAvatar = true, showRightAvatar = true }) => {
  const isUser = message.isUser;
  const isCopied = copiedMessageId === message.id;
  const [isExpanded, setIsExpanded] = useState(false);

  // Consider content "long" when above threshold to enable collapse
  const isLong = useMemo(() => (message.content?.length || 0) > 800, [message.content]);

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
      {!isUser && showLeftAvatar && (
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
        <div className={cn(
          'text-sm leading-relaxed markdown-body transition-[max-height] duration-300 ease-in-out',
          !isUser && isLong && !isExpanded ? 'max-h-56 overflow-hidden pr-2' : 'max-h-fit'
        )}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ inline, className, children, ...props }: any) {
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
              a({ children, ...props }: any) {
                return (
                  <a className="text-primary-600 hover:underline" target="_blank" rel="noreferrer" {...props}>
                    {children}
                  </a>
                );
              },
              ul({ children }: any) {
                return <ul className="list-disc pl-5 space-y-1">{children}</ul>;
              },
              ol({ children }: any) {
                return <ol className="list-decimal pl-5 space-y-1">{children}</ol>;
              },
              p({ children }: any) {
                return <p className="whitespace-pre-wrap">{children}</p>;
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
          {/* Gradient fade when collapsed */}
          {!isUser && isLong && !isExpanded && (
            <div className="pointer-events-none absolute bottom-10 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent" />
          )}
        </div>

        {/* Show more/less control for long AI answers */}
        {!isUser && isLong && (
          <div className="mt-2">
            <Button variant={isUser ? 'secondary' : 'primary'} size="sm" onClick={() => setIsExpanded(v => !v)}>
              {isExpanded ? 'Zobrazit méně' : 'Zobrazit více'}
            </Button>
          </div>
        )}
        
        {/* Copy button for AI messages */}
        {!isUser && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex space-x-1">
              {onCopyMessage && (
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
              )}
              {onRegenerate && (
                <Button variant="secondary" size="sm" onClick={() => onRegenerate(message.id)} className="h-6 w-6 p-0">↻</Button>
              )}
              {onDeleteMessage && (
                <Button variant="secondary" size="sm" onClick={() => onDeleteMessage(message.id)} className="h-6 w-6 p-0">×</Button>
              )}
            </div>
          </div>
        )}

        {/* Citations / Footnotes (for future RAG). Render if present on message */}
        {!isUser && Array.isArray((message as any).citations) && (message as any).citations.length > 0 && (
          <div className="mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
            <div className="flex items-center gap-2 mb-1 font-medium">
              <BookOpen className="h-3.5 w-3.5" />
              Zdroje
            </div>
            <ul className="space-y-1">
              {((message as any).citations as Array<{ label: string; url?: string }>).map((c, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-neutral-500 dark:text-neutral-400">[{idx + 1}]</span>
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-600 hover:underline">
                      {c.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span>{c.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Timestamp */}
        <div
          className={cn(
            'absolute -bottom-5 right-0 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity',
            isUser ? 'text-primary-100' : 'text-neutral-500 dark:text-neutral-400'
          )}
          title={new Date(message.timestamp).toLocaleString('cs-CZ')}
        >
          {new Date(message.timestamp).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {isUser && showRightAvatar && (
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