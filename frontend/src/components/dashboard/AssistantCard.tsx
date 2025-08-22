/* eslint-disable react/prop-types */
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIFeature } from '../../types';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getAssistantIcon } from '../icons';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { cn } from '../../utils/cn';

interface AssistantCardProps {
  feature: AIFeature;
}

// icons are centralized in components/icons

const AssistantCard: React.FC<AssistantCardProps> = React.memo(({ feature }) => {
  const navigate = useNavigate();
  const { viewport, state } = useResponsive();
  const { isMobile } = state;
  const isTouchDevice = viewport.touchDevice;

  const handleClick = useCallback(() => {
    navigate('/chat');
  }, [navigate]);

  // Responsive classes
  const cardClasses = cn(
    'h-full cursor-pointer rounded-xl p-[1px] bg-gradient-to-br from-white/20 via-white/10 to-white/0 dark:from-white/10 dark:via-white/5 dark:to-white/0 backdrop-blur group transition-all duration-200',
    
    // Touch-friendly enhancements
    isTouchDevice && [
      'touch-manipulation',
      'active:scale-[0.98]',
      'min-h-[44px]' // Ensure minimum touch target
    ],
    
    // Hover effects (disabled on touch devices to prevent sticky hover)
    !isTouchDevice && [
      'hover:-translate-y-1 hover:shadow-brand'
    ],
    
    // Focus styles for accessibility
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900'
  );

  const contentClasses = cn(
    'h-full rounded-xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/70 dark:border-neutral-800/70 shadow-soft',
    
    // Responsive padding
    isMobile ? 'p-4' : 'p-6'
  );

  const headerClasses = cn(
    'flex items-center justify-between mb-4',
    
    // Stack header elements on very small screens
    isMobile && 'flex-col sm:flex-row gap-2 sm:gap-0'
  );

  const iconContainerClasses = cn(
    'flex items-center',
    isMobile ? 'space-x-2' : 'space-x-3'
  );

  const iconClasses = cn(
    'rounded-lg bg-white/70 dark:bg-neutral-800/60 ring-1 ring-neutral-200/60 dark:ring-neutral-700/60',
    isMobile ? 'p-1.5' : 'p-2'
  );

  const titleClasses = cn(
    'font-semibold text-neutral-900 dark:text-neutral-100 mb-2',
    isMobile ? 'text-base' : 'text-lg'
  );

  const descriptionClasses = cn(
    'text-gray-600 dark:text-neutral-300 mb-4 flex-1 leading-relaxed',
    isMobile ? 'text-xs' : 'text-sm'
  );

  const footerClasses = cn(
    'flex items-center justify-between pt-4 border-t border-gray-100/70 dark:border-neutral-800/70',
    
    // Stack footer on very small screens
    isMobile && 'flex-col sm:flex-row gap-2 sm:gap-0'
  );

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cardClasses}
      role="button"
      tabIndex={0}
      aria-label={`Spustit ${feature.name} - ${feature.credits_per_use} kreditů`}
    >
      <div className={contentClasses}>
        <div className={headerClasses}>
          <div className={iconContainerClasses}>
            <div className={iconClasses}>
              {getAssistantIcon(feature.id)}
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className={cn('text-yellow-500', isMobile ? 'h-3 w-3' : 'h-4 w-4')} />
              <span className={cn('font-medium text-gray-600 dark:text-neutral-300', isMobile ? 'text-xs' : 'text-sm')}>
                {feature.credits_per_use} kredit
              </span>
            </div>
          </div>
          {!isMobile && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Klikněte pro detaily</span>
          )}
        </div>
        
        <h3 className={titleClasses}>{feature.name}</h3>
        
        <p className={descriptionClasses}>
          {feature.description}
        </p>
        
        <div className={footerClasses}>
          <span className={cn(
            'text-gray-500 dark:text-neutral-400 group-hover:text-blue-600 transition-colors duration-200',
            isMobile ? 'text-xs' : 'text-xs'
          )}>
            {isMobile ? 'Klepněte pro spuštění' : 'Klikněte pro spuštění'}
          </span>
          <div className="flex items-center space-x-1 text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
            <span className={cn('font-medium', isMobile ? 'text-xs' : 'text-sm')}>Spustit</span>
            <ArrowRight className={cn('group-hover:translate-x-1 transition-transform duration-200', isMobile ? 'h-3 w-3' : 'h-4 w-4')} />
          </div>
        </div>
      </div>
    </div>
  );
});

AssistantCard.displayName = 'AssistantCard';

export default AssistantCard; 