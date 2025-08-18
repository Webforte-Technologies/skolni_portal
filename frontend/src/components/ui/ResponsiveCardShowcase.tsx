import React, { useState } from 'react';
import Card from './Card';
import InteractiveCard from './InteractiveCard';
import ResponsiveCardGrid from './ResponsiveCardGrid';
import ResponsiveCardLayout from './ResponsiveCardLayout';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { Heart, Star, Share, MoreHorizontal, Smartphone, Tablet, Monitor } from 'lucide-react';
import Button from './Button';

/**
 * Showcase component demonstrating all responsive card features
 * This component serves as both documentation and testing for card responsiveness
 */
const ResponsiveCardShowcase: React.FC = () => {
  const { viewport, state } = useResponsive();
  const { isMobile, isTablet } = state;
  const isTouchDevice = viewport.touchDevice;
  const [likedCards, setLikedCards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  const handleLike = (cardId: string) => {
    setLikedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleAction = async (action: string, cardId: string) => {
    setLoading(cardId);
    // Simulate async action
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(null);
    console.log(`${action} action for card ${cardId}`);
  };

  const getCurrentDeviceIcon = () => {
    if (isMobile) return <Smartphone className="w-4 h-4" />;
    if (isTablet) return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8 p-4">
      {/* Viewport Information */}
      <Card title="Responsive Card Showcase" icon={getCurrentDeviceIcon()}>
        <div className="space-y-2 text-sm">
          <p><strong>Viewport:</strong> {viewport.width} × {viewport.height}px</p>
          <p><strong>Breakpoint:</strong> {viewport.breakpoint}</p>
          <p><strong>Orientation:</strong> {viewport.orientation}</p>
          <p><strong>Touch Device:</strong> {isTouchDevice ? 'Yes' : 'No'}</p>
        </div>
      </Card>

      {/* Basic Responsive Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Responsive Cards</h2>
        
        <ResponsiveCardGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }}>
          <Card title="Expanded Layout" mobileLayout="expanded">
            <p>This card uses expanded layout on mobile with full padding and spacing.</p>
            <div className="mt-4 space-y-2">
              <div className="h-2 bg-blue-200 rounded"></div>
              <div className="h-2 bg-blue-100 rounded w-3/4"></div>
            </div>
          </Card>

          <Card title="Compact Layout" mobileLayout="compact">
            <p>This card uses compact layout on mobile with reduced padding and smaller text.</p>
            <div className="mt-3 space-y-1">
              <div className="h-1.5 bg-green-200 rounded"></div>
              <div className="h-1.5 bg-green-100 rounded w-2/3"></div>
            </div>
          </Card>

          <Card title="Touch Actions" touchActions={true}>
            <p>This card has touch-optimized interactions with press animations.</p>
            <div className="mt-4 flex gap-2">
              <div className="w-8 h-8 bg-purple-200 rounded-full"></div>
              <div className="w-8 h-8 bg-purple-100 rounded-full"></div>
            </div>
          </Card>
        </ResponsiveCardGrid>
      </div>

      {/* Interactive Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Interactive Cards</h2>
        
        <ResponsiveCardGrid columns={{ mobile: 1, tablet: 2, desktop: 2 }}>
          <InteractiveCard
            title="Clickable Card"
            onPress={() => handleAction('click', 'card1')}
            loading={loading === 'card1'}
            ariaLabel="Click to perform action"
          >
            <p>Click or tap this card to see the interaction.</p>
            <div className="mt-4 flex items-center gap-2">
              <Button size="sm" variant="secondary">Action</Button>
              <span className="text-xs text-neutral-500">
                {isTouchDevice ? 'Tap to interact' : 'Click to interact'}
              </span>
            </div>
          </InteractiveCard>

          <InteractiveCard
            title="Long Press Card"
            onPress={() => handleAction('press', 'card2')}
            onLongPress={() => handleAction('long press', 'card2')}
            loading={loading === 'card2'}
            ariaLabel="Press or long press for actions"
          >
            <p>This card supports both regular press and long press actions.</p>
            <div className="mt-4 text-xs text-neutral-500">
              {isTouchDevice ? 'Tap or hold for 500ms' : 'Click or hold for 500ms'}
            </div>
          </InteractiveCard>
        </ResponsiveCardGrid>
      </div>

      {/* Social Media Style Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Social Media Style Cards</h2>
        
        <ResponsiveCardLayout layout="auto" minCardWidth={300}>
          {[1, 2, 3].map((id) => (
            <InteractiveCard
              key={id}
              className="overflow-hidden"
              pressAnimation={true}
              hoverElevation={true}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
                  <div>
                    <div className="font-medium text-sm">User {id}</div>
                    <div className="text-xs text-neutral-500">2 hours ago</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <p className="text-sm mb-4">
                This is a sample post content that demonstrates how cards adapt to different screen sizes 
                and maintain readability across devices.
              </p>

              {/* Image placeholder */}
              <div className="w-full h-32 bg-gradient-to-r from-pink-300 to-blue-300 rounded-lg mb-4"></div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(`social-${id}`);
                    }}
                    className={likedCards.has(`social-${id}`) ? 'text-red-500' : ''}
                  >
                    <Heart className={`w-4 h-4 ${likedCards.has(`social-${id}`) ? 'fill-current' : ''}`} />
                    <span className="ml-1 text-xs">
                      {likedCards.has(`social-${id}`) ? 'Liked' : 'Like'}
                    </span>
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <Star className="w-4 h-4" />
                    <span className="ml-1 text-xs">Save</span>
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Share className="w-4 h-4" />
                  <span className="ml-1 text-xs">Share</span>
                </Button>
              </div>
            </InteractiveCard>
          ))}
        </ResponsiveCardLayout>
      </div>

      {/* Masonry Layout */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Masonry Layout</h2>
        
        <ResponsiveCardLayout layout="masonry" breakpoints={{ mobile: 1, tablet: 2, desktop: 3 }}>
          {[
            { height: 'h-32', content: 'Short content card' },
            { height: 'h-48', content: 'Medium height card with more content that spans multiple lines and demonstrates how masonry layout handles different card heights.' },
            { height: 'h-24', content: 'Tiny card' },
            { height: 'h-40', content: 'Another medium card with some content that shows the staggered layout.' },
            { height: 'h-56', content: 'Tall card with lots of content. This card demonstrates how the masonry layout automatically arranges cards of different heights in an optimal way.' },
            { height: 'h-28', content: 'Small card content' }
          ].map((item, index) => (
            <Card key={index} title={`Card ${index + 1}`}>
              <div className={item.height}>
                <p className="text-sm">{item.content}</p>
              </div>
            </Card>
          ))}
        </ResponsiveCardLayout>
      </div>
    </div>
  );
};

export default ResponsiveCardShowcase;