import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  noindex?: boolean;
  canonicalUrl?: string;
  alternateUrls?: Array<{
    hreflang: string;
    href: string;
  }>;
  structuredData?: object;
}

const defaultSEOData = {
  siteName: 'FreelanceConfía',
  title: 'FreelanceConfía - Conectamos talento freelance confiable en América Latina',
  description: 'Plataforma líder para encontrar y contratar freelancers verificados en América Latina. Conecta con profesionales de confianza para proyectos digitales, marketing, desarrollo y más.',
  keywords: 'freelancers, trabajo remoto, América Latina, talento digital, proyectos freelance, profesionales independientes',
  type: 'website',
  locale: 'es_ES',
  author: 'FreelanceConfía',
  twitterCard: 'summary_large_image' as const,
  twitterSite: '@freelanceconfia',
  image: '/hero-freelancers.jpg',
};

const SEO: React.FC<SEOProps> = ({
  title,
  description = defaultSEOData.description,
  keywords = defaultSEOData.keywords,
  image = defaultSEOData.image,
  url,
  type = defaultSEOData.type,
  author = defaultSEOData.author,
  publishedTime,
  modifiedTime,
  locale = defaultSEOData.locale,
  siteName = defaultSEOData.siteName,
  twitterCard = defaultSEOData.twitterCard,
  twitterSite = defaultSEOData.twitterSite,
  twitterCreator,
  noindex = false,
  canonicalUrl,
  alternateUrls,
  structuredData,
}) => {
  const fullTitle = title 
    ? `${title} | ${siteName}`
    : defaultSEOData.title;

  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const imageUrl = image.startsWith('http') 
    ? image 
    : `${typeof window !== 'undefined' ? window.location.origin : ''}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Alternate URLs for internationalization */}
      {alternateUrls?.map((alt, index) => (
        <link
          key={index}
          rel="alternate"
          hrefLang={alt.hreflang}
          href={alt.href}
        />
      ))}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={description} />
      {currentUrl && <meta property="og:url" content={currentUrl} />}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      
      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
      
      {/* Additional Meta */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#2563eb" />
      
      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Security */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Default Structured Data for Organization */}
      {!structuredData && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": siteName,
            "description": description,
            "url": currentUrl || "https://freelanceconfia.com",
            "logo": imageUrl,
            "sameAs": [
              "https://twitter.com/freelanceconfia",
              "https://linkedin.com/company/freelanceconfia",
              "https://facebook.com/freelanceconfia"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "availableLanguage": ["Spanish", "English"]
            }
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;