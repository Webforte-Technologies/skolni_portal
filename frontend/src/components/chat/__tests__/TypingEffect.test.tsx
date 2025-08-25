import React from 'react';
import { render, screen } from '@testing-library/react';
import TypingEffect from '../TypingEffect';

describe('TypingEffect', () => {
  it('renders with default settings', () => {
    render(<TypingEffect content="Hello World" />);
    // Check that the component renders and contains the react-markdown mock
    expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<TypingEffect content="Test" className="custom-class" />);
    const container = screen.getByTestId('react-markdown').closest('.inline');
    expect(container).toHaveClass('custom-class');
  });

  it('renders without autoStart when specified', () => {
    render(<TypingEffect content="Test" autoStart={false} />);
    expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
  });

  it('renders with showCursor when specified', () => {
    render(<TypingEffect content="Test" showCursor={true} autoStart={true} />);
    // Check that cursor element exists - look for it in the parent container
    const container = screen.getByTestId('react-markdown').closest('.inline');
    const cursor = container?.querySelector('span');
    expect(cursor).toBeInTheDocument();
    expect(cursor).toHaveClass('inline-block', 'w-0.5', 'h-4', 'bg-primary-600');
  });

  it('does not show cursor when showCursor is false', () => {
    render(<TypingEffect content="Test" showCursor={false} autoStart={true} />);
    // Should not have a cursor element
    const container = screen.getByTestId('react-markdown').closest('.inline');
    const cursor = container?.querySelector('span');
    expect(cursor).not.toBeInTheDocument();
  });

  it('renders with custom speed prop', () => {
    render(<TypingEffect content="Test" speed={100} />);
    expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
  });
});
