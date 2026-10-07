import type { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Fredoka, Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
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
  authors: [{ name: siteDetails.metadata.author }],
  creator: siteDetails.metadata.author,
  publisher: siteDetails.siteName,
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
  openGraph: {
    title: siteDetails.metadata.openGraph.title,
    description: siteDetails.metadata.openGraph.description,
    url: siteDetails.siteUrl,
    siteName: siteDetails.siteName,
    locale: siteDetails.locale,
    type: 'website',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: siteDetails.siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteDetails.metadata.twitter.title,
    description: siteDetails.metadata.twitter.description,
    images: ['/images/og-image.png'],
  },
  alternates: {
    canonical: 'https://imlogo.uz',
  },
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

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Imlo Go',
              url: 'https://imlogo.uz',
              description: "O'zbek tilidagi birinchi raqamli diktant tekshiruvchi platforma va o'zbekcha so'zlarda tez yozish mashqi",
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'Web, Windows, Android, iOS',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              inLanguage: 'uz',
              author: {
                '@type': 'Organization',
                name: 'Imlo Go Team',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
