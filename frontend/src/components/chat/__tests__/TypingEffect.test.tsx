import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import TypingEffect from '../TypingEffect';

describe('TypingEffect', () => {
  it('renders with default settings', () => {
    render(<TypingEffect content="Hello World" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('starts typing effect when autoStart is true', async () => {
    render(<TypingEffect content="Test" speed={10} autoStart={true} />);
    
    // Initially should be empty
    expect(screen.getByText('')).toBeInTheDocument();
    
    // After typing effect completes, should show full content
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('does not start typing effect when autoStart is false', () => {
    render(<TypingEffect content="Test" autoStart={false} />);
    expect(screen.getByText('')).toBeInTheDocument();
  });

  it('shows cursor when showCursor is true and typing', () => {
    render(<TypingEffect content="Test" showCursor={true} autoStart={true} />);
    const cursor = screen.getByRole('generic', { hidden: true });
    expect(cursor).toBeInTheDocument();
  });

  it('does not show cursor when showCursor is false', () => {
    render(<TypingEffect content="Test" showCursor={false} autoStart={true} />);
    const cursor = screen.queryByRole('generic', { hidden: true });
    expect(cursor).not.toBeInTheDocument();
  });

  it('calls onComplete when typing finishes', async () => {
    const onComplete = jest.fn();
    render(<TypingEffect content="Test" onComplete={onComplete} speed={10} autoStart={true} />);
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    }, { timeout: 1000 });
  });
});
