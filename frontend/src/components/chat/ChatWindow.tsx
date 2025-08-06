import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import Message from './Message';

interface ChatWindowProps {
  messages: ChatMessage[];
  onCopyMessage?: (messageId: string, content: string) => void;
  copiedMessageId?: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onCopyMessage, copiedMessageId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Začněte konverzaci
            </h3>
            <p className="text-gray-500">
              Napište svůj dotaz a AI asistent vám pomůže s výukou
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <Message 
              key={`${message.id}-${index}`} 
              message={message}
              onCopyMessage={onCopyMessage}
              copiedMessageId={copiedMessageId}
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default ChatWindow; 