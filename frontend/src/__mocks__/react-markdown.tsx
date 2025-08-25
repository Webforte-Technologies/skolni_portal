import React from 'react';

interface ReactMarkdownProps {
  children: React.ReactNode;
  remarkPlugins?: any[];
  rehypePlugins?: any[];
  components?: Record<string, React.ComponentType<any>>;
  className?: string;
}

const ReactMarkdown: React.FC<ReactMarkdownProps> = ({ children, className }) => {
  // For testing purposes, render the text content directly
  // This simulates how the actual ReactMarkdown would render plain text
  // We need to handle both string and non-string children
  const renderContent = () => {
    if (typeof children === 'string') {
      return children;
    }
    if (React.isValidElement(children)) {
      return children;
    }
    if (Array.isArray(children)) {
      return children.map((child, index) => 
        typeof child === 'string' ? child : React.cloneElement(child as React.ReactElement, { key: index })
      );
    }
    return children;
  };

  return (
    <div className={className} data-testid="react-markdown">
      {renderContent()}
    </div>
  );
};

export default ReactMarkdown;
