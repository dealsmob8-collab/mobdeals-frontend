import type { Metadata } from 'next'
import './globals.css'
import { AnnouncementStrip } from '@/components/announcement-strip'
import { Header } from '@/components/header'
import { ChatWidget } from '@/components/chat-widget'

export const metadata: Metadata = {
  title: 'MobDeals - Kenya\'s Premier Tech Store | 2-Hour Nairobi Delivery',
  description: 'Shop the latest smartphones, laptops, and tech accessories in Kenya. 2-hour delivery in Nairobi, M-PESA payments, next-day nationwide dispatch. Visit our store at Moi Avenue, Tembo House Cooperative.',
  keywords: 'Kenya, Nairobi, smartphones, laptops, tech, M-PESA, mobile phones, electronics, online shopping',
  authors: [{ name: 'MobDeals' }],
  creator: 'MobDeals',
  publisher: 'MobDeals',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://shop.mobdeals.co.ke',
  },
  openGraph: {
    title: 'MobDeals - Kenya\'s Premier Tech Store',
    description: '2-hour delivery in Nairobi | M-PESA | Cash on Delivery',
    url: 'https://shop.mobdeals.co.ke',
    siteName: 'MobDeals',
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MobDeals - Kenya\'s Premier Tech Store',
    description: '2-hour delivery in Nairobi | M-PESA | Cash on Delivery',
  },
  verification: {
    google: 'your-google-verification-code',
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
