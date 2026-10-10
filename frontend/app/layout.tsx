import type { Metadata, Viewport } from 'next';
import { AppProviders } from '@/components/ui/AppProviders';
import { getContent, getSite } from '@/lib/server-api';
import './globals.css';
import '../styles/lawson.css';
import '../styles/staff.css';

export const metadata: Metadata = {
  title: { default: 'Lawson Digital Solutions — Software & IT Services, Austin TX', template: '%s — Lawson Digital Solutions' },
  description: 'Custom software, web development, IT consulting and systems integration from Lawson Digital Solutions in Austin, Texas.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#171923' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [site, content] = await Promise.all([getSite(), getContent()]);
  // Structured data for search engines, built from the live contact details.
  const ld = site && {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.businessName,
    email: site.email,
    telephone: site.phone.replace(/[^\d+]/g, '').replace(/^\+?1?(\d{3})(\d{3})(\d{4})$/, '+1-$1-$2-$3'),
    address: { '@type': 'PostalAddress', streetAddress: site.street, addressLocality: site.locality },
  };
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
        {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />}
      </head>
      <body>
        <AppProviders site={site} content={content}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
