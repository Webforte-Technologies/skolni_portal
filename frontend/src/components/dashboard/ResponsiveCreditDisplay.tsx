import React from 'react';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { CreditCard, Plus, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface ResponsiveCreditDisplayProps {
  credits: number;
  onAddCredits: () => void;
  isAddingCredits: boolean;
}

/**
 * Responsive credit display component that adapts to different screen sizes
 * - Mobile: Compact horizontal layout with prominent credit count
 * - Desktop: Vertical layout with gradient background
 */
const ResponsiveCreditDisplay: React.FC<ResponsiveCreditDisplayProps> = ({
  credits,
  onAddCredits,
  isAddingCredits,
}) => {
  const { viewport, state } = useResponsive();
  const { isMobile } = state;

  if (isMobile) {
    // Mobile: Compact horizontal layout
    return (
      <Card 
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-lg"
        mobileLayout="compact"
        touchActions={true}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold">{credits}</div>
              <div className="text-white/80 text-xs">kreditů</div>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onAddCredits}
            disabled={isAddingCredits}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex-shrink-0"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            {isAddingCredits ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="text-xs text-white/70 text-center">
            Každá zpráva stojí 1 kredit
          </div>
        </div>
      </Card>
    );
  }

  // Desktop/Tablet: Vertical layout with full gradient
  return (
    <Card 
      className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg"
      touchActions={viewport.touchDevice}
    >
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-white mb-3">Vaše kredity</h3>
        <div className="text-3xl lg:text-4xl font-bold mb-1">{credits}</div>
        <div className="text-white/80 text-sm">dostupné kreditů</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-white/70 mb-4">
          Každá zpráva stojí 1 kredit
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onAddCredits}
          disabled={isAddingCredits}
          className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
          style={{ minHeight: '44px' }}
        >
          {isAddingCredits ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Přidávám...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              + Přidat 100 Demo Kreditů
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default ResponsiveCreditDisplay;