import type { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Source_Sans_3, Manrope } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteDetails } from '@/data/siteDetails';
import "./globals.css";
import CharacterCursor from "@/components/CharacterCursor";

const manrope = Manrope({ subsets: ['latin'] });
const sourceSans = Source_Sans_3({ subsets: ['latin'] });

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
        <link rel="canonical" href="https://imlogo.uz" />
      </head>
      <body
        className={`${manrope.className} ${sourceSans.className} antialiased`}
      >
        {siteDetails.googleAnalyticsId && <GoogleAnalytics gaId={siteDetails.googleAnalyticsId} />}
        <Header />
        <main>
          <CharacterCursor />
          {children}
        </main>
        <Footer />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Imlo Go',
              url: 'https://imlogo.uz',
              description: "O'zbek tilidagi birinchi raqamli diktant tekshiruvchi platforma",
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
