import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/components/providers/StoreContext';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LastCry — Thoughtful Essentials & Dignified Goodbyes',
  description:
    'India-first online store for end-of-life essentials, curated tradition-specific ritual kits, memorial products, condolence gifts, and verified local service referrals.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'LastCry — Thoughtful Essentials & Dignified Goodbyes',
    description:
      'Find last-rites essentials, thoughtfully curated ritual kits, memorial products, and helpful guidance in one trusted place.',
    type: 'website',
    siteName: 'LastCry India',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LastCry — Thoughtful Essentials & Dignified Goodbyes',
    description:
      'Find last-rites essentials, thoughtfully curated ritual kits, memorial products, and helpful guidance in one trusted place.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LastCry',
    slogan: 'Thoughtful essentials. Dignified goodbyes.',
    description:
      'India-first online store for end-of-life essentials, funeral and last-rites products, tradition-specific kits, memorial products, and condolence gifts.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@lastcry.in',
      contactType: 'customer support',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
  };

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-[#FAF8F5] font-sans text-[#1C1B19] antialiased selection:bg-[#2E473B] selection:text-[#FAF8F5]"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <StoreProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-[#1C1B19] focus:px-4 focus:py-2 focus:text-xs focus:text-[#FAF8F5]"
          >
            Skip to main content
          </a>
          <SiteHeader />
          <div id="main-content" className="flex-1">
            {children}
          </div>
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
