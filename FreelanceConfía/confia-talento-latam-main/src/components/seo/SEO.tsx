import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  article?: {
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
  };
  noIndex?: boolean;
  canonicalUrl?: string;
  structuredData?: object;
}

const SEO: React.FC<SEOProps> = ({
  title = 'FreelanceConfía - Plataforma de Freelancers en América Latina',
  description = 'Conecta con los mejores freelancers de América Latina. Plataforma segura con pagos escrow, chat en tiempo real y verificación de identidad.',
  keywords = [
    'freelancers',
    'trabajo remoto',
    'América Latina',
    'proyectos',
    'programadores',
    'diseñadores',
    'marketing digital',
    'pagos seguros',
    'escrow'
  ],
  image = '/og-image.jpg',
  url = 'https://freelanceconfia.com',
  type = 'website',
  article,
  noIndex = false,
  canonicalUrl,
  structuredData
}) => {
  const fullTitle = title.includes('FreelanceConfía') 
    ? title 
    : `${title} | FreelanceConfía`;

  const fullUrl = url.startsWith('http') ? url : `https://freelanceconfia.com${url}`;
  const fullImageUrl = image.startsWith('http') 
    ? image 
    : `https://freelanceconfia.com${image}`;

  // Default structured data for the website
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FreelanceConfía",
    "alternateName": "FreelanceConfia",
    "url": "https://freelanceconfia.com",
    "description": description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://freelanceconfia.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://twitter.com/freelanceconfia",
      "https://facebook.com/freelanceconfia",
      "https://linkedin.com/company/freelanceconfia",
      "https://instagram.com/freelanceconfia"
    ]
  };

  // Organization structured data
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FreelanceConfía",
    "url": "https://freelanceconfia.com",
    "logo": "https://freelanceconfia.com/logo.png",
    "description": description,
    "foundingDate": "2024",
    "founders": [
      {
        "@type": "Person",
        "name": "Equipo FreelanceConfía"
      }
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+52-55-1234-5678",
      "contactType": "customer service",
      "availableLanguage": ["Spanish", "English", "Portuguese"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Ciudad de México",
      "addressCountry": "MX"
    },
    "areaServed": [
      {
        "@type": "Country",
        "name": "México"
      },
      {
        "@type": "Country", 
        "name": "Colombia"
      },
      {
        "@type": "Country",
        "name": "Argentina"
      },
      {
        "@type": "Country",
        "name": "Chile"
      },
      {
        "@type": "Country",
        "name": "Perú"
      }
    ]
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      
      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#2563eb" />
      <meta name="color-scheme" content="light dark" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl || fullUrl} />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="googlebot" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="FreelanceConfía" />
      <meta property="og:locale" content="es_MX" />
      <meta property="og:locale:alternate" content="es_CO" />
      <meta property="og:locale:alternate" content="es_AR" />
      <meta property="og:locale:alternate" content="es_CL" />
      <meta property="og:locale:alternate" content="es_PE" />
      
      {/* Article specific OG tags */}
      {article && type === 'article' && (
        <>
          <meta property="article:author" content={article.author} />
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime} />
          <meta property="article:section" content={article.section} />
          {article.tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@freelanceconfia" />
      <meta name="twitter:creator" content="@freelanceconfia" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="FreelanceConfía" />
      <meta name="publisher" content="FreelanceConfía" />
      <meta name="copyright" content="© 2024 FreelanceConfía. Todos los derechos reservados." />
      
      {/* Language and Location */}
      <meta name="language" content="Spanish" />
      <meta name="geo.region" content="MX" />
      <meta name="geo.placename" content="América Latina" />
      
      {/* Mobile App */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="FreelanceConfía" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      <link rel="preconnect" href="https://api.freelanceconfia.com" />
      
      {/* DNS prefetch */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(organizationData)}
      </script>
      
      {/* Preload critical resources */}
      <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      
      {/* Performance hints */}
      <meta httpEquiv="x-dns-prefetch-control" content="on" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Security headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      
      {/* Cache control */}
      <meta httpEquiv="Cache-Control" content="public, max-age=31536000" />
    </Helmet>
  );
};

export default SEO;

// Utility functions for common SEO patterns
export const generatePageSEO = (pageType: string, data?: any) => {
  const seoConfigs = {
    home: {
      title: 'FreelanceConfía - Plataforma de Freelancers en América Latina',
      description: 'Conecta con los mejores freelancers de América Latina. Plataforma segura con pagos escrow, chat en tiempo real y verificación de identidad.',
      keywords: ['freelancers', 'trabajo remoto', 'América Latina', 'proyectos']
    },
    projects: {
      title: 'Proyectos de Freelance - FreelanceConfía',
      description: 'Encuentra proyectos de desarrollo, diseño, marketing y más. Oportunidades para freelancers en toda América Latina.',
      keywords: ['proyectos freelance', 'trabajos remotos', 'oportunidades', 'desarrollo', 'diseño']
    },
    freelancers: {
      title: 'Freelancers Verificados - FreelanceConfía',
      description: 'Contrata freelancers talentosos y verificados. Programadores, diseñadores, marketers digitales y más profesionales.',
      keywords: ['contratar freelancers', 'profesionales', 'verificados', 'talento', 'expertos']
    },
    profile: {
      title: data?.name ? `${data.name} - Freelancer en FreelanceConfía` : 'Perfil de Freelancer',
      description: data?.bio || 'Perfil profesional de freelancer en FreelanceConfía',
      keywords: [data?.skills || 'freelancer', 'perfil profesional', 'portafolio'].flat()
    },
    project: {
      title: data?.title ? `${data.title} - Proyecto en FreelanceConfía` : 'Proyecto de Freelance',
      description: data?.description || 'Proyecto disponible para freelancers en FreelanceConfía',
      keywords: [data?.skills || 'proyecto', 'freelance', 'oportunidad'].flat()
    }
  };

  return seoConfigs[pageType as keyof typeof seoConfigs] || seoConfigs.home;
};

// Generate sitemap data
export const generateSitemap = () => {
  const baseUrl = 'https://freelanceconfia.com';
  const pages = [
    { url: '', priority: 1.0, changefreq: 'daily' },
    { url: '/projects', priority: 0.9, changefreq: 'hourly' },
    { url: '/freelancers', priority: 0.9, changefreq: 'daily' },
    { url: '/categories', priority: 0.8, changefreq: 'weekly' },
    { url: '/about', priority: 0.7, changefreq: 'monthly' },
    { url: '/contact', priority: 0.6, changefreq: 'monthly' },
    { url: '/register', priority: 0.8, changefreq: 'monthly' },
    { url: '/login', priority: 0.5, changefreq: 'monthly' }
  ];

  return pages.map(page => ({
    url: `${baseUrl}${page.url}`,
    lastmod: new Date().toISOString(),
    priority: page.priority,
    changefreq: page.changefreq
  }));
};