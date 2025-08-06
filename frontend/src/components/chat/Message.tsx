import React from 'react';
import { ChatMessage } from '../../types';
import { cn } from '../../utils/cn';
import { User, Bot } from 'lucide-react';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.isUser;

  return (
    <div className={cn(
      'flex items-start space-x-3 mb-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
        </div>
      )}
      
      <div className={cn(
        'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-white border border-gray-200 text-gray-900'
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Message; 