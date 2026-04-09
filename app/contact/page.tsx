import Link from 'next/link'
import {
  buildWhatsAppUrl,
  GOOGLE_MAPS_URL,
  SITE_DESCRIPTION,
  STORE_HOURS,
  STORE_LOCATION,
  SUPPORT_EMAIL,
  WHATSAPP_DISPLAY,
  DEFAULT_WHATSAPP_MESSAGE,
} from '@/lib/site'

export const metadata = {
  title: 'Contact | MobDeals Kenya',
  description: SITE_DESCRIPTION,
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-mobdeals-red">Home</Link>
        <span>/</span>
        <span className="text-foreground">Contact</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h1 className="text-2xl font-bold md:text-3xl">Contact MobDeals</h1>
          <p className="mt-3 text-muted-foreground">
            Reach us for product availability, pricing, delivery, and warranty support.
          </p>

          <div className="mt-6 space-y-4 text-sm">
            <div>
              <p className="font-semibold">WhatsApp</p>
              <a
                href={buildWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE)}
                className="text-mobdeals-red hover:underline"
              >
                {WHATSAPP_DISPLAY}
              </a>
            </div>
            <div>
              <p className="font-semibold">Phone</p>
              <p>{WHATSAPP_DISPLAY}</p>
            </div>
            <div>
              <p className="font-semibold">Email</p>
              <p>{SUPPORT_EMAIL}</p>
            </div>
            <div>
              <p className="font-semibold">Store</p>
              <p>{STORE_LOCATION}</p>
            </div>
          </div>

          <a
            href={buildWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-full bg-mobdeals-red px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-mobdeals-orangeDark"
          >
            Chat on WhatsApp
          </a>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Business Hours</h2>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Monday - Saturday</span>
              <span>{STORE_HOURS}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Sunday</span>
              <span>Closed</span>
            </div>
          </div>

          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-full bg-mobdeals-red px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-mobdeals-orangeDark"
          >
            Get Directions
          </a>
        </section>
      </div>
    </div>
  )
}
