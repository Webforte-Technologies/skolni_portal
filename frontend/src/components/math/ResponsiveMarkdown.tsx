import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';
import ResponsiveKaTeX from './ResponsiveKaTeX';

interface ResponsiveMarkdownProps {
  children: string;
  className?: string;
  components?: Record<string, React.ComponentType<any>>;
}

const ResponsiveMarkdown: React.FC<ResponsiveMarkdownProps> = ({
  children,
  className,
  components = {},
}) => {
  const { isMobile, isTablet } = useResponsive();

  // Pre-process content to extract and replace math expressions
  const processedContent = React.useMemo(() => {
    let content = children;
    
    // Replace display math blocks ($$...$$) with placeholders
    const displayMathRegex = /\$\$([\s\S]*?)\$\$/g;
    const displayMathMatches: string[] = [];
    content = content.replace(displayMathRegex, (_match, mathContent) => {
      const index = displayMathMatches.length;
      displayMathMatches.push(mathContent.trim());
      return `__DISPLAY_MATH_${index}__`;
    });
    
    // Replace inline math ($...$) with placeholders
    const inlineMathRegex = /\$([^$\n]+?)\$/g;
    const inlineMathMatches: string[] = [];
    content = content.replace(inlineMathRegex, (_match, mathContent) => {
      const index = inlineMathMatches.length;
      inlineMathMatches.push(mathContent.trim());
      return `__INLINE_MATH_${index}__`;
    });
    
    return { content, displayMathMatches, inlineMathMatches };
  }, [children]);

  const defaultComponents = {
    code({ inline, className, children, ...props }: any) {
      const code = String(children);
      if (inline) {
        return (
          <code className={cn(
            'rounded bg-muted dark:bg-neutral-800',
            isMobile ? 'px-1 py-0.5 text-[0.75em]' : 'px-1.5 py-0.5 text-[0.85em]'
          )} {...props}>
            {code}
          </code>
        );
      }
      return (
        <pre className={cn(
          'bg-muted dark:bg-neutral-900 rounded-md overflow-x-auto',
          isMobile ? 'p-2 text-[0.75em]' : 'p-3 text-[0.85em]'
        )}>
          <code className={className} {...props}>{code}</code>
        </pre>
      );
    },
    a({ children, ...props }: any) {
      return (
        <a className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    },
    ul({ children }: any) {
      return <ul className="list-disc pl-5 space-y-1">{children}</ul>;
    },
    ol({ children }: any) {
      return <ol className="list-decimal pl-5 space-y-1">{children}</ol>;
    },
    p({ children }: any) {
      // Process paragraph content for math placeholders
      const processedChildren = React.Children.map(children, (child) => {
        if (typeof child === 'string') {
          return processMathPlaceholders(child, processedContent.displayMathMatches, processedContent.inlineMathMatches, isMobile, isTablet);
        }
        return child;
      });
      
      return <p className="whitespace-pre-wrap">{processedChildren}</p>;
    },
    // Handle text nodes that might contain math placeholders
    text({ children }: any) {
      if (typeof children === 'string') {
        return processMathPlaceholders(children, processedContent.displayMathMatches, processedContent.inlineMathMatches, isMobile, isTablet);
      }
      return children;
    },
  };

  const mergedComponents = { ...defaultComponents, ...components };

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        components={mergedComponents}
      >
        {processedContent.content}
      </ReactMarkdown>
    </div>
  );
};

// Helper function to process math placeholders in text
const processMathPlaceholders = (
  text: string, 
  displayMathMatches: string[], 
  inlineMathMatches: string[],
  isMobile: boolean,
  isTablet: boolean
): React.ReactNode => {
  // If no math placeholders, return original text
  if (!text.includes('__DISPLAY_MATH_') && !text.includes('__INLINE_MATH_')) {
    return text;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Process display math placeholders
  const displayMathRegex = /__DISPLAY_MATH_(\d+)__/g;
  let match;
  
  while ((match = displayMathRegex.exec(text)) !== null) {
    // Add text before the math
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    // Add the math component
    const mathIndex = parseInt(match[1]);
    const mathContent = displayMathMatches[mathIndex];
    if (mathContent) {
      parts.push(
        <ResponsiveKaTeX
          key={`display-${mathIndex}`}
          math={mathContent}
          displayMode={true}
          enableZoom={isMobile || isTablet}
          enablePan={isMobile || isTablet}
          className="my-2"
        />
      );
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Process inline math placeholders in remaining text
  let remainingText = text.slice(lastIndex);
  const inlineMathRegex = /__INLINE_MATH_(\d+)__/g;
  let inlineLastIndex = 0;
  
  while ((match = inlineMathRegex.exec(remainingText)) !== null) {
    // Add text before the math
    if (match.index > inlineLastIndex) {
      parts.push(remainingText.slice(inlineLastIndex, match.index));
    }
    
    // Add the math component
    const mathIndex = parseInt(match[1]);
    const mathContent = inlineMathMatches[mathIndex];
    if (mathContent) {
      parts.push(
        <ResponsiveKaTeX
          key={`inline-${mathIndex}`}
          math={mathContent}
          displayMode={false}
          enableZoom={false}
          enablePan={false}
          className="inline"
        />
      );
    }
    
    inlineLastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text
  if (inlineLastIndex < remainingText.length) {
    parts.push(remainingText.slice(inlineLastIndex));
  }
  
  return parts.length === 0 ? text : (parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts);
};

export default ResponsiveMarkdown;