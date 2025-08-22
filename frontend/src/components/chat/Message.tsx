import { useCallback, useMemo, useState } from 'react';
import { ChatMessage, MathTopic, MathDifficulty } from '../../types';
import { cn } from '../../utils/cn';
import { User, Bot, Copy, Check, BookOpen, ExternalLink, Target, TrendingUp, Star } from 'lucide-react';
import Button from '../ui/Button';
import ResponsiveMarkdown from '../math/ResponsiveMarkdown';
import { forwardRef } from 'react';

interface MessageProps {
  message: ChatMessage;
  onCopyMessage?: (messageId: string, content: string) => void;
  copiedMessageId?: string | null;
  onDeleteMessage?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  showLeftAvatar?: boolean;
  showRightAvatar?: boolean;
  isMobile?: boolean;
  isTablet?: boolean;
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



const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, onCopyMessage, copiedMessageId, onDeleteMessage, onRegenerate, showLeftAvatar = true, showRightAvatar = true, isMobile = false, isTablet = false }) => {
    const isUser = message.isUser;
    const isCopied = copiedMessageId === message.id;
    const [isExpanded, setIsExpanded] = useState(true);

    // Consider content "long" when above threshold to enable collapse - shorter threshold on mobile
    const isLong = useMemo(() => (message.content?.length || 0) > (isMobile ? 400 : 800), [message.content, isMobile]);

    const handleCopy = useCallback(() => {
      if (onCopyMessage) {
        onCopyMessage(message.id, message.content);
      }
    }, [onCopyMessage, message.id, message.content]);

    return (
      <div className={cn(
        'flex items-start mb-4 animate-slide-up',
        isMobile ? 'space-x-2' : 'space-x-3',
        isUser ? 'justify-end' : 'justify-start'
      )}>
        {!isUser && showLeftAvatar && (
          <div className="flex-shrink-0">
            <div className={cn(
              'bg-primary-600 rounded-full flex items-center justify-center shadow-soft',
              isMobile ? 'w-8 h-8' : 'w-10 h-10'
            )}>
              <Bot className={cn('text-white', isMobile ? 'h-4 w-4' : 'h-6 w-6')} />
            </div>
          </div>
        )}
        
        <div className={cn(
          'relative group shadow-lg transition-all duration-200 hover:shadow-xl rounded-2xl',
          // Responsive max-width and padding
          isMobile 
            ? 'max-w-[85%] px-3 py-2' 
            : isTablet 
              ? 'max-w-md px-3 py-3' 
              : 'max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3',
          // Colors and effects
          isUser 
            ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-primary-500/25 hover:shadow-primary-500/35 hover:-translate-y-0.5' 
            : 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/30 border border-primary-200 dark:border-primary-700/50 text-primary-900 dark:text-primary-100 shadow-primary-500/10 hover:shadow-primary-500/20 hover:-translate-y-0.5'
        )}>
          {/* Math Topic and Difficulty Tags */}
          {!isUser && (message.mathTopic || message.difficulty) && (
            <div className={cn('flex flex-wrap gap-2', isMobile ? 'mb-2' : 'mb-3')}>
              {message.mathTopic && (
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full font-medium border',
                  isMobile ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
                  getTopicColor(message.mathTopic)
                )}>
                  {getTopicName(message.mathTopic)}
                </span>
              )}
              {message.difficulty && (
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full font-medium border',
                  isMobile ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
                  getDifficultyColor(message.difficulty)
                )}>
                  {getDifficultyIcon(message.difficulty)}
                  {message.difficulty === 'basic' && 'Základní'}
                  {message.difficulty === 'intermediate' && 'Střední'}
                  {message.difficulty === 'advanced' && 'Pokročilé'}
                </span>
              )}
              {message.practiceMode && (
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700',
                  isMobile ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'
                )}>
                  <Target className={cn(isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
                  Cvičení
                </span>
              )}
            </div>
          )}

          <div className={cn(
            'relative leading-relaxed markdown-body',
            isMobile ? 'text-xs' : 'text-sm',
            !isUser && isLong && !isExpanded 
              ? isMobile 
                ? 'max-h-32 overflow-hidden pr-2' 
                : 'max-h-56 overflow-hidden pr-2' 
              : 'max-h-none'
          )}>
            <ResponsiveMarkdown>
              {message.content}
            </ResponsiveMarkdown>
            {/* Gradient fade when collapsed */}
            {!isUser && isLong && !isExpanded && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-primary-50 dark:from-primary-900/20 to-transparent" />
            )}
          </div>

          {/* Message Actions */}
          {!isUser && (
            <div className={cn(
              'absolute top-2 right-2 transition-opacity duration-200 flex items-center gap-1',
              isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}>
              {onCopyMessage && (
                <Button
                  onClick={handleCopy}
                  variant="secondary"
                  size="icon"
                  className={cn(
                    'p-0',
                    isMobile ? 'w-8 h-8 min-h-[44px] min-w-[44px]' : 'w-6 h-6'
                  )}
                  title="Kopírovat zprávu"
                >
                  {isCopied ? (
                    <Check className={cn(isMobile ? 'h-4 w-4' : 'h-3 w-3')} />
                  ) : (
                    <Copy className={cn(isMobile ? 'h-4 w-4' : 'h-3 w-3')} />
                  )}
                </Button>
              )}
              {onDeleteMessage && (
                <Button
                  onClick={() => onDeleteMessage(message.id)}
                  variant="danger"
                  size="icon"
                  className={cn(
                    'p-0',
                    isMobile ? 'w-8 h-8 min-h-[44px] min-w-[44px]' : 'w-6 h-6'
                  )}
                  title="Smazat zprávu"
                >
                  <ExternalLink className={cn(isMobile ? 'h-4 w-4' : 'h-3 w-3')} />
                </Button>
              )}
              {onRegenerate && (
                <Button
                  onClick={() => onRegenerate(message.id)}
                  variant="secondary"
                  size="icon"
                  className={cn(
                    'p-0',
                    isMobile ? 'w-8 h-8 min-h-[44px] min-w-[44px]' : 'w-6 h-6'
                  )}
                  title="Přegenerovat odpověď"
                >
                  <BookOpen className={cn(isMobile ? 'h-4 w-4' : 'h-3 w-3')} />
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
                className={cn(
                  isMobile 
                    ? 'text-[10px] px-2 py-1 min-h-[44px]' 
                    : 'text-xs px-2 py-1'
                )}
              >
                {isExpanded ? 'Sbalit' : 'Zobrazit více'}
              </Button>
            </div>
          )}
        </div>

        {isUser && showRightAvatar && (
          <div className="flex-shrink-0">
            <div className={cn(
              'bg-gradient-to-r from-neutral-600 to-neutral-700 rounded-full flex items-center justify-center shadow-soft',
              isMobile ? 'w-8 h-8' : 'w-10 h-10'
            )}>
              <User className={cn('text-white', isMobile ? 'h-4 w-4' : 'h-6 w-6')} />
            </div>
          </div>
        )}
      </div>
    );
  }
);

Message.displayName = 'Message';

export default Message; 