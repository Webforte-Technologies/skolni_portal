import React from 'react';
import { TypingEffectSettings } from '../../hooks/useTypingEffect';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import { Settings, RotateCcw } from 'lucide-react';

interface TypingEffectSettingsComponentProps {
  settings: TypingEffectSettings;
  onUpdateSettings: (settings: Partial<TypingEffectSettings>) => void;
  onResetSettings: () => void;
  className?: string;
}

const TypingEffectSettingsComponent: React.FC<TypingEffectSettingsComponentProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
  className = ''
}) => {
  return (
    <div className={cn('space-y-4 p-4 bg-card border rounded-lg', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Nastavení efektu psaní
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetSettings}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Enable/Disable Typing Effect */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Efekt psaní
          </label>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onUpdateSettings({ enabled: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
        </div>

        {/* Typing Speed */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Rychlost psaní: {settings.speed}ms/znak
          </label>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={settings.speed}
            onChange={(e) => onUpdateSettings({ speed: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            disabled={!settings.enabled}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Rychle</span>
            <span>Pomalu</span>
          </div>
        </div>

        {/* Show Cursor */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Zobrazit kurzor
          </label>
          <input
            type="checkbox"
            checked={settings.showCursor}
            onChange={(e) => onUpdateSettings({ showCursor: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            disabled={!settings.enabled}
          />
        </div>

        {/* Cursor Blink Speed */}
        {settings.showCursor && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Rychlost blikání kurzoru: {settings.cursorBlinkSpeed}ms
            </label>
            <input
              type="range"
              min="200"
              max="1000"
              step="100"
              value={settings.cursorBlinkSpeed}
              onChange={(e) => onUpdateSettings({ cursorBlinkSpeed: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              disabled={!settings.enabled}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Rychle</span>
              <span>Pomalu</span>
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground pt-2 border-t">
        <p>Efekt psaní simuluje, jak AI asistent "píše" odpověď znak po znaku.</p>
      </div>
    </div>
  );
};

export default TypingEffectSettingsComponent;
