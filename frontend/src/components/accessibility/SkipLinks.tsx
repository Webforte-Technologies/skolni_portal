import React from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Přejít na hlavní obsah' },
  { href: '#navigation', label: 'Přejít na navigaci' },
  { href: '#footer', label: 'Přejít na zápatí' },
];

const SkipLinks: React.FC<SkipLinksProps> = ({ links = defaultLinks }) => {
  const { isMobile, isTablet } = useAccessibility();

  const getSkipLinkClasses = () => {
    const baseClasses = `
      absolute top-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded
      transform -translate-y-full opacity-0 transition-all duration-200
      focus:translate-y-0 focus:opacity-100
      hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    `;

    if (isMobile) {
      return `${baseClasses} text-lg px-6 py-3`;
    } else if (isTablet) {
      return `${baseClasses} text-base px-5 py-2.5`;
    } else {
      return `${baseClasses} text-sm`;
    }
  };

  return (
    <div className="skip-links">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className={getSkipLinkClasses()}
          onFocus={(e) => {
            // Ensure the link is visible when focused
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.opacity = '1';
          }}
          onBlur={(e) => {
            // Hide the link when focus is lost
            e.currentTarget.style.transform = 'translateY(-100%)';
            e.currentTarget.style.opacity = '0';
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

export default SkipLinks;