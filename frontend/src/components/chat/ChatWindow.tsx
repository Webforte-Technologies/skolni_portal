/* eslint-disable react/prop-types */
import React, { useRef, useCallback, useState, useMemo } from 'react';
import { ChatMessage } from '../../types';
import Message from './Message';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useResponsive } from '../../hooks/useViewport';

interface ChatWindowProps {
  messages: ChatMessage[];
  onCopyMessage?: (messageId: string, content: string) => void;
  copiedMessageId?: string | null;
  isTyping?: boolean;
  onDeleteMessage?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = React.memo(({ 
  messages, 
  onCopyMessage, 
  copiedMessageId, 
  isTyping = false,
  onDeleteMessage,
  onRegenerate
}) => {
  const listRef = useRef<VirtuosoHandle>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const { isMobile, isTablet } = useResponsive();

  // Group messages early so hooks below can depend on it safely
  const grouped = useMemo(() => {
    return messages.map((m, i) => {
      const prev = i > 0 ? messages[i - 1] : undefined;
      const next = i < messages.length - 1 ? messages[i + 1] : undefined;
      return {
        ...m,
        showLeftAvatar: !m.isUser && (!prev || prev.isUser !== m.isUser),
        showRightAvatar: m.isUser && (!prev || prev.isUser !== m.isUser),
        isFirstOfGroup: !prev || prev.isUser !== m.isUser,
        isLastOfGroup: !next || next.isUser !== m.isUser,
      } as ChatMessage & { showLeftAvatar: boolean; showRightAvatar: boolean; isFirstOfGroup: boolean; isLastOfGroup: boolean };
    });
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToIndex({ index: Math.max(0, grouped.length - 1), behavior: 'smooth' });
  }, [grouped.length]);

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
    <div className="relative flex-1 min-h-0 bg-card dark:bg-primary-950/30">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full px-4">
          <div className="text-center max-w-md">
            <div className="text-primary-400 dark:text-primary-300 mb-4">
              <svg className={`mx-auto ${isMobile ? 'h-8 w-8' : 'h-12 w-12'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-foreground dark:text-primary-100 mb-2`}>
              Začněte konverzaci
            </h3>
            <p className={`${isMobile ? 'text-sm' : 'text-base'} text-primary-600 dark:text-primary-300`}>
              Napište svůj dotaz a AI asistent vám pomůže s výukou
            </p>
          </div>
        </div>
      ) : (
        <div className="h-full min-h-0 flex flex-col">
          <Virtuoso
            ref={listRef}
            style={{ height: '100%' }}
            data={grouped}
            followOutput={isNearBottom ? 'smooth' : false}
            atBottomStateChange={(atBottom) => setIsNearBottom(atBottom)}
            itemContent={(index, message) => {
              const prev = index > 0 ? grouped[index - 1] : undefined;
              return (
                <div className={`${isMobile ? 'px-2 py-1' : 'px-4 py-2'}`}>
                  {shouldShowDate(message, prev) && (
                    <div className="sticky top-2 z-0 flex justify-center">
                      <span className={`${isMobile ? 'text-xs px-2 py-1' : 'text-xs px-2 py-1'} rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300`}>
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                  )}
                  <Message
                    message={message}
                    onCopyMessage={onCopyMessage}
                    copiedMessageId={copiedMessageId}
                    onDeleteMessage={onDeleteMessage}
                    onRegenerate={onRegenerate}
                    showLeftAvatar={(message as any).showLeftAvatar}
                    showRightAvatar={(message as any).showRightAvatar}
                    isMobile={isMobile}
                    isTablet={isTablet}
                  />
                </div>
              );
            }}
            components={{
              Footer: () => (
                isTyping ? (
                  <div className={`${isMobile ? 'px-2 py-2' : 'px-4 py-2'}`}>
                    <div className={`flex items-start ${isMobile ? 'space-x-2' : 'space-x-3'} mb-4`}>
                      <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-primary-600 rounded-full flex items-center justify-center shadow-soft`}>
                        <svg className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-white`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                        </svg>
                      </div>
                      <div className={`bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700/50 text-primary-900 dark:text-primary-100 shadow-sm ${isMobile ? 'px-3 py-2' : 'px-4 py-3'} rounded-lg`}>
                        <div className="flex space-x-1">
                          <span className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-primary-500 dark:bg-primary-400 rounded-full animate-bounce [animation-delay:0ms]`} />
                          <span className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-primary-500 dark:bg-primary-400 rounded-full animate-bounce [animation-delay:150ms]`} />
                          <span className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-primary-500 dark:bg-primary-400 rounded-full animate-bounce [animation-delay:300ms]`} />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null
              )
            }}
          />
          {!isNearBottom && (
            <button
              type="button"
              onClick={scrollToBottom}
              className={`fixed ${isMobile ? 'bottom-20 right-3' : 'bottom-24 sm:bottom-28 right-4 sm:right-8'} z-10 inline-flex items-center ${isMobile ? 'px-2 py-2' : 'px-3 py-2'} rounded-full bg-primary-600 text-white shadow-soft hover:bg-primary-700 transition-colors ${isMobile ? 'min-h-[44px] min-w-[44px]' : ''}`}
              aria-label="Scroll to bottom"
            >
              <svg className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M3.293 7.293a1 1 0 011.414 0L10 12.586l5.293-5.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow; 