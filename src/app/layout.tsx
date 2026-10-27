import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from '@next/third-parties/google';
import Script from 'next/script';
import { Fredoka, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import JsonLd from '@/components/JsonLd';
import { siteDetails } from '@/data/siteDetails';
import "./globals.css";

const heading = Space_Grotesk({ subsets: ['latin', 'latin-ext'], variable: '--font-heading', display: 'swap' });
const body = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-body', display: 'swap' });
// Faqat logotip uchun
const logo = Fredoka({ subsets: ['latin'], weight: '700', variable: '--font-logo', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://imlogo.uz'),
  title: {
    default: siteDetails.metadata.title,
    template: '%s | Imlo Go',
  },
  description: siteDetails.metadata.description,
  keywords: siteDetails.metadata.keywords,
  applicationName: siteDetails.siteName,
  authors: [{ name: siteDetails.metadata.author }],
  creator: siteDetails.metadata.author,
  publisher: siteDetails.siteName,
  category: 'education',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Rasm `opengraph-image.tsx` dan avtomatik qo'shiladi.
  openGraph: {
    title: siteDetails.metadata.openGraph.title,
    description: siteDetails.metadata.openGraph.description,
    url: siteDetails.siteUrl,
    siteName: siteDetails.siteName,
    locale: siteDetails.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteDetails.metadata.twitter.title,
    description: siteDetails.metadata.twitter.description,
  },
  alternates: {
    canonical: '/',
  },
};

export const viewport: Viewport = {
  themeColor: '#6750A4',
};

/** Butun sayt uchun tuzilmaviy ma'lumot: tashkilot, sayt va veb-ilova. */
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://imlogo.uz/#organization',
      name: siteDetails.siteName,
      url: 'https://imlogo.uz',
      logo: 'https://imlogo.uz/images/logo.svg',
      sameAs: [siteDetails.telegramChannel],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://imlogo.uz/#website',
      name: siteDetails.siteName,
      url: 'https://imlogo.uz',
      inLanguage: 'uz',
      publisher: { '@id': 'https://imlogo.uz/#organization' },
    },
    {
      '@type': 'WebApplication',
      name: siteDetails.siteName,
      url: 'https://imlogo.uz/app',
      description: siteDetails.metadata.description,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web, Windows, Android, iOS',
      inLanguage: 'uz',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'UZS' },
      featureList: [
        'Audio diktantni avtomatik tekşiriş',
        'Özbekça tez yoziş maşqi (eski lotin, yangi lotin, kirill)',
        'Kirill, lotin va yangi özbek alifbosi orasida transliteratsiya',
        'Hamjamiyat reytingi va haftalik musobaqa',
      ],
      publisher: { '@id': 'https://imlogo.uz/#organization' },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <head>
        <meta name="google-site-verification" content="G6pz2wyPxNp4awm1mHbtfuCD75sbYU0soGlXvySux9E" />
      </head>
      <body
        className={`${heading.variable} ${body.variable} ${mono.variable} ${logo.variable} antialiased`}
      >
        {siteDetails.googleAnalyticsId && <GoogleAnalytics gaId={siteDetails.googleAnalyticsId} />}
        {children}

        <JsonLd data={structuredData} />

        {/* Savdox AI yordamchi vidjeti */}
        <Script
          src="https://cdn.savdox.uz/savdox-widget.js"
          data-key="wk_11FKnHo6T4sBhYD-iZZxi8ta"
          data-api="https://api.savdox.uz"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
