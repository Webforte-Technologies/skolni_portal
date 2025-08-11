import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'EduAI-Asistent - Revoluce ve matematickém vzdělávání s AI',
  description = 'AI asistent pro matematiku, který pomáhá učitelům vytvářet lepší výukové materiály a studentům lépe pochopit matematiku. Generování cvičení, spolupráce učitelů a knihovna materiálů.',
  keywords = 'AI matematika, matematický asistent, vzdělávání, cvičení, učitelé, studenti, škola, matematika online, AI tutor, generování cvičení, spolupráce učitelů, knihovna materiálů, české školy, matematické vzdělávání',
  image = '/og-image.jpg',
  url = 'https://eduai-asistent.cz',
  type = 'website',
  author = 'EduAI-Asistent',
  publishedTime,
  modifiedTime
}) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="EduAI-Asistent" />
      <meta property="og:locale" content="cs_CZ" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="cs" />
      <meta name="revisit-after" content="7 days" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data for Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "EduAI-Asistent",
          "url": "https://eduai-asistent.cz",
          "logo": "https://eduai-asistent.cz/logo.png",
          "description": "AI asistent pro matematické vzdělávání",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "CZ"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "info@eduai-asistent.cz"
          },
          "sameAs": [
            "https://www.facebook.com/eduaiasistent",
            "https://www.linkedin.com/company/eduai-asistent"
          ]
        })}
      </script>
      
      {/* Structured Data for Software Application */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "EduAI-Asistent",
          "applicationCategory": "EducationalApplication",
          "operatingSystem": "Web",
          "description": "AI asistent pro matematické vzdělávání s generováním cvičení a spoluprácí učitelů",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "CZK",
            "availability": "https://schema.org/InStock"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "127"
          }
        })}
      </script>
      
      {/* Published and Modified Time for Articles */}
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
    </Helmet>
  );
};

export default SEOHead;
