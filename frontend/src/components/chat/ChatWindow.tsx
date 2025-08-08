import React, { useRef, useEffect, useCallback, useState } from 'react';
import { ChatMessage } from '../../types';
import Message from './Message';

interface ChatWindowProps {
  messages: ChatMessage[];
  onCopyMessage?: (messageId: string, content: string) => void;
  copiedMessageId?: string | null;
  isTyping?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = React.memo(({ messages, onCopyMessage, copiedMessageId, isTyping = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 80; // px from bottom considered "near bottom"
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsNearBottom(distanceFromBottom < threshold);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Optional: day separator util
  const shouldShowDate = (current: ChatMessage, previous?: ChatMessage) => {
    if (!previous) return true;
    const a = new Date(previous.timestamp);
    const b = new Date(current.timestamp);
    return a.toDateString() !== b.toDateString();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const yest = new Date();
    yest.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Dnes';
    if (d.toDateString() === yest.toDateString()) return 'Včera';
    return d.toLocaleDateString('cs-CZ');
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-white dark:bg-neutral-950">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-neutral-400 dark:text-neutral-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Začněte konverzaci
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400">
              Napište svůj dotaz a AI asistent vám pomůže s výukou
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message, index) => {
            const prev = index > 0 ? messages[index-1] : undefined;
            return (
              <React.Fragment key={`${message.id}-${index}`}>
                {shouldShowDate(message, prev) && (
                  <div className="sticky top-2 z-0 flex justify-center">
                    <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                )}
                <Message 
                  message={message}
                  onCopyMessage={onCopyMessage}
                  copiedMessageId={copiedMessageId}
                />
              </React.Fragment>
            );
          })}
          {isTyping && (
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center shadow-soft">
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm px-4 py-3 rounded-lg">
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
          {!isNearBottom && (
            <button
              type="button"
              onClick={scrollToBottom}
              className="fixed bottom-28 right-8 z-10 inline-flex items-center px-3 py-2 rounded-full bg-primary-600 text-white shadow-soft hover:bg-primary-700 transition-colors"
              aria-label="Scroll to bottom"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M3.293 7.293a1 1 0 011.414 0L10 12.586l5.293-5.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow; 