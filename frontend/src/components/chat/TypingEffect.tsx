import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';
import ResponsiveMarkdown from '../math/ResponsiveMarkdown';

interface TypingEffectProps {
  content: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  className?: string;
  showCursor?: boolean;
  cursorBlinkSpeed?: number;
  autoStart?: boolean;
}

const TypingEffect: React.FC<TypingEffectProps> = ({
  content,
  speed = 30,
  onComplete,
  className = '',
  showCursor = true,
  cursorBlinkSpeed = 500,
  autoStart = true
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showCursorBlink, setShowCursorBlink] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursorIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start typing effect
  const startTyping = () => {
    if (isTyping || currentIndex >= content.length) return;
    
    setIsTyping(true);
    setCurrentIndex(0);
    setDisplayedContent('');
    
    const typeNextCharacter = () => {
      if (currentIndex < content.length) {
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        
        timeoutRef.current = setTimeout(typeNextCharacter, speed);
      } else {
        setIsTyping(false);
        onComplete?.();
      }
    };
    
    typeNextCharacter();
  };

  // Stop typing effect
  const stopTyping = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsTyping(false);
    setDisplayedContent(content);
    setCurrentIndex(content.length);
    onComplete?.();
  };

  // Cursor blink effect
  useEffect(() => {
    if (showCursor && isTyping) {
      cursorIntervalRef.current = setInterval(() => {
        setShowCursorBlink(prev => !prev);
      }, cursorBlinkSpeed);
    } else {
      setShowCursorBlink(true);
    }

    return () => {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
        cursorIntervalRef.current = null;
      }
    };
  }, [showCursor, isTyping, cursorBlinkSpeed]);

  // Auto-start typing when content changes
  useEffect(() => {
    if (autoStart && content && !isTyping) {
      startTyping();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [content, autoStart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('inline', className)}>
      <ResponsiveMarkdown>
        {displayedContent}
      </ResponsiveMarkdown>
      {showCursor && isTyping && (
        <span 
          className={cn(
            'inline-block w-0.5 h-4 bg-primary-600 ml-0.5 transition-opacity duration-75',
            showCursorBlink ? 'opacity-100' : 'opacity-0'
          )}
          style={{ animation: showCursorBlink ? 'none' : 'none' }}
        />
      )}
    </div>
  );
};

export default TypingEffect;
