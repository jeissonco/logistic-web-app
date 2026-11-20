import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Brand face from brandonsshreddingboxes.com.au.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'BSB Driver',
  description: 'Driver runsheet — stops, drops and pick-ups.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/brand/bsb-icon.png', apple: '/brand/bsb-icon.png' },
  appleWebApp: { capable: true, title: 'BSB Driver', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#2b2b2b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`light ${poppins.variable}`}>
      <head>
        {/* Material Symbols is an icon font, not a text face — next/font doesn't cover it. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-dvh bg-background text-on-surface">
        <Providers>
          <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
