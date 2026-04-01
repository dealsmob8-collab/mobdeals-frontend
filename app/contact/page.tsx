import Link from 'next/link'

export const metadata = {
  title: 'Contact | MobDeals Kenya',
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
                href="https://wa.me/254700000000"
                className="text-mobdeals-red hover:underline"
              >
                +254 700 000 000
              </a>
            </div>
            <div>
              <p className="font-semibold">Phone</p>
              <p>+254 700 000 000</p>
            </div>
            <div>
              <p className="font-semibold">Email</p>
              <p>support@mobdeals.co.ke</p>
            </div>
            <div>
              <p className="font-semibold">Store</p>
              <p>Moi Avenue, Tembo House Cooperative, Nairobi</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Business Hours</h2>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Monday - Saturday</span>
              <span>9:00 AM - 7:00 PM</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Sunday</span>
              <span>Closed</span>
            </div>
          </div>

          <a
            href="https://maps.google.com/?q=Moi+Avenue+Tembo+House+Cooperative+Nairobi"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-full bg-mobdeals-red px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Get Directions
          </a>
        </section>
      </div>
    </div>
  )
}
