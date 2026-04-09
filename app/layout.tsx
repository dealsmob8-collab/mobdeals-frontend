import type { Metadata } from 'next'
import './globals.css'
import { AnnouncementStrip } from '@/components/announcement-strip'
import { Header } from '@/components/header'
import { ChatWidget } from '@/components/chat-widget'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Phones, laptops, and tech deals in Nairobi`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords:
    'phones, laptops, accessories, Nairobi, Kenya, WhatsApp shopping, M-PESA, electronics',
  authors: [{ name: 'MobDeals' }],
  creator: 'MobDeals',
  publisher: 'MobDeals',
  robots: 'index, follow',
  icons: {
    icon: [
      {
        url: '/brand/mobdeals-logo.png',
        type: 'image/png',
      },
    ],
    shortcut: '/brand/mobdeals-logo.png',
    apple: '/brand/mobdeals-logo.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${SITE_NAME} | Phones, laptops, and tech deals in Nairobi`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_KE',
    type: 'website',
    images: [
      {
        url: '/home/hero-desktop.png',
        width: 1920,
        height: 1080,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Phones, laptops, and tech deals in Nairobi`,
    description: SITE_DESCRIPTION,
    images: ['/home/hero-desktop.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://origin.mobdeals.co.ke" />
        <link rel="dns-prefetch" href="https://origin.mobdeals.co.ke" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AnnouncementStrip />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <ChatWidget />
      </body>
    </html>
  )
}
