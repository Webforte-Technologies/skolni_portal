import React, { useCallback, useMemo, useState } from 'react';
import { ChatMessage, MathTopic, MathDifficulty } from '../../types';
import { cn } from '../../utils/cn';
import { User, Bot, Copy, Check, BookOpen, ExternalLink, Target, TrendingUp, Star } from 'lucide-react';
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

const getDifficultyIcon = (difficulty: MathDifficulty) => {
  switch (difficulty) {
    case 'basic':
      return <Target className="h-3 w-3" />;
    case 'intermediate':
      return <TrendingUp className="h-3 w-3" />;
    case 'advanced':
      return <Star className="h-3 w-3" />;
    default:
      return null;
  }
};

const getDifficultyColor = (difficulty: MathDifficulty) => {
  switch (difficulty) {
    case 'basic':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
    case 'intermediate':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
    case 'advanced':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
    default:
      return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700';
  }
};

const getTopicColor = (topic: MathTopic) => {
  const topicColors: Record<MathTopic, string> = {
    basic_math: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700',
    algebra: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700',
    geometry: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700',
    calculus: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700',
    statistics: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
    discrete_math: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700',
    physics: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700',
    chemistry: 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-700',
    biology: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700',
    history: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700',
    czech_language: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-700',
    other: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
  };
  return topicColors[topic] || topicColors.other;
};

const getTopicName = (topic: MathTopic) => {
  const topicNames: Record<MathTopic, string> = {
    basic_math: 'Základní matematika',
    algebra: 'Algebra',
    geometry: 'Geometrie',
    calculus: 'Analýza',
    statistics: 'Statistika',
    discrete_math: 'Diskrétní matematika',
    physics: 'Fyzika',
    chemistry: 'Chemie',
    biology: 'Biologie',
    history: 'Dějepis',
    czech_language: 'Český jazyk',
    other: 'Jiné'
  };
  return topicNames[topic] || 'Jiné';
};

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
        'max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl relative group shadow-lg transition-all duration-200 hover:shadow-xl',
        isUser 
          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-primary-500/25 hover:shadow-primary-500/35 hover:-translate-y-0.5' 
          : 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/30 border border-primary-200 dark:border-primary-700/50 text-primary-900 dark:text-primary-100 shadow-primary-500/10 hover:shadow-primary-500/20 hover:-translate-y-0.5'
      )}>
        {/* Math Topic and Difficulty Tags */}
        {!isUser && (message.mathTopic || message.difficulty) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {message.mathTopic && (
              <span className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                getTopicColor(message.mathTopic)
              )}>
                {getTopicName(message.mathTopic)}
              </span>
            )}
            {message.difficulty && (
              <span className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                getDifficultyColor(message.difficulty)
              )}>
                {getDifficultyIcon(message.difficulty)}
                {message.difficulty === 'basic' && 'Základní'}
                {message.difficulty === 'intermediate' && 'Střední'}
                {message.difficulty === 'advanced' && 'Pokročilé'}
              </span>
            )}
            {message.practiceMode && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                <Target className="h-3 w-3" />
                Cvičení
              </span>
            )}
          </div>
        )}

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
                    <code className="px-1.5 py-0.5 rounded bg-muted dark:bg-neutral-800 text-[0.85em]" {...props}>
                      {code}
                    </code>
                  );
                }
                return (
                  <pre className="bg-muted dark:bg-neutral-900 rounded-md p-3 overflow-x-auto text-[0.85em]">
                    <code className={className} {...props}>{code}</code>
                  </pre>
                );
              },
              a({ children, ...props }: any) {
                return (
                  <a className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
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
            <div className="pointer-events-none absolute bottom-10 left-0 right-0 h-16 bg-gradient-to-t from-primary-50 dark:from-primary-900/20 to-transparent" />
          )}
        </div>

        {/* Message Actions */}
        {!isUser && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
            {onCopyMessage && (
              <Button
                onClick={handleCopy}
                variant="secondary"
                size="icon"
                className="w-6 h-6 p-0"
                title="Kopírovat zprávu"
              >
                {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            )}
            {onDeleteMessage && (
              <Button
                onClick={() => onDeleteMessage(message.id)}
                variant="danger"
                size="icon"
                className="w-6 h-6 p-0"
                title="Smazat zprávu"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            {onRegenerate && (
              <Button
                onClick={() => onRegenerate(message.id)}
                variant="secondary"
                size="icon"
                className="w-6 h-6 p-0"
                title="Přegenerovat odpověď"
              >
                <BookOpen className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Expand/Collapse Button for Long Messages */}
        {!isUser && isLong && (
          <div className="absolute bottom-2 right-2">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="secondary"
              size="sm"
              className="text-xs px-2 py-1"
            >
              {isExpanded ? 'Zobrazit méně' : 'Zobrazit více'}
            </Button>
          </div>
        )}
      </div>

      {isUser && showRightAvatar && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-r from-neutral-600 to-neutral-700 rounded-full flex items-center justify-center shadow-soft">
            <User className="h-6 w-6 text-white" />
          </div>
        </div>
      )}
    </div>
  );
});

export default Message; 