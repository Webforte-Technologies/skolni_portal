# Typing Effect Feature

## Overview

The typing effect feature simulates AI "typing" responses character by character, creating a more engaging and natural chat experience. Instead of showing the complete AI response immediately, the text appears gradually as if the AI is typing in real-time.

## Components

### TypingEffect
- **Location**: `frontend/src/components/chat/TypingEffect.tsx`
- **Purpose**: Core component that handles the character-by-character animation
- **Features**:
  - Configurable typing speed
  - Blinking cursor animation
  - Markdown rendering support
  - Auto-start and manual control options

### TypingEffectSettings
- **Location**: `frontend/src/components/chat/TypingEffectSettings.tsx`
- **Purpose**: UI component for configuring typing effect preferences
- **Features**:
  - Enable/disable typing effect
  - Adjust typing speed (10-100ms per character)
  - Toggle cursor visibility
  - Configure cursor blink speed (200-1000ms)

### useTypingEffect Hook
- **Location**: `frontend/src/hooks/useTypingEffect.ts`
- **Purpose**: Manages typing effect settings and persistence
- **Features**:
  - Local storage persistence
  - Default settings management
  - Settings update and reset functionality

## How It Works

1. **Streaming Response**: The backend streams AI responses as chunks
2. **Content Accumulation**: Frontend accumulates the full response
3. **Typing Effect Application**: If enabled, the full response is displayed with typing animation
4. **Settings Integration**: User preferences control the behavior

## Configuration

### Default Settings
```typescript
{
  enabled: true,
  speed: 30, // milliseconds per character
  showCursor: true,
  cursorBlinkSpeed: 500 // milliseconds
}
```

### User Controls
- **Settings Button**: Located in chat header (gear icon)
- **Modal Interface**: Full settings panel with sliders and toggles
- **Persistent Storage**: Settings saved to localStorage

## Integration Points

### ChatPage
- Integrates typing effect settings
- Provides settings modal
- Handles streaming response accumulation

### ChatWindow
- Passes typing effect settings to Message components
- Manages typing state for AI responses

### Message Component
- Renders TypingEffect for AI messages when appropriate
- Falls back to normal rendering for user messages or disabled effect

## Usage

### Enabling/Disabling
1. Click the "Efekt psaní" button in chat header
2. Toggle the "Efekt psaní" switch
3. Settings are automatically saved

### Adjusting Speed
1. Open typing effect settings
2. Use the "Rychlost psaní" slider
3. Range: 10ms (fast) to 100ms (slow) per character

### Customizing Cursor
1. Toggle "Zobrazit kurzor" for cursor visibility
2. Adjust "Rychlost blikání kurzoru" for blink speed
3. Range: 200ms (fast) to 1000ms (slow)

## Technical Details

### Performance Considerations
- Typing effect only applies to AI responses
- User messages display immediately
- Settings are cached in localStorage
- Minimal impact on chat performance

### Accessibility
- Settings are keyboard accessible
- Screen reader compatible
- High contrast cursor styling
- Responsive design for mobile

### Browser Compatibility
- Modern browsers with CSS animations support
- Fallback to immediate display if animations not supported
- Progressive enhancement approach

## Future Enhancements

### Potential Features
- Sound effects for typing
- Different cursor styles
- Per-conversation settings
- Advanced animation options
- Voice typing simulation

### Performance Optimizations
- Virtual scrolling integration
- Lazy loading for long responses
- Animation frame optimization
- Memory management for large conversations
