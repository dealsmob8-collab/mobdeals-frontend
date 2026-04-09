import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import {
  buildWhatsAppUrl,
  DEFAULT_WHATSAPP_MESSAGE,
} from '@/lib/site'

interface HomeHeroProps {
  desktopHeroImageSrc?: string
  mobileHeroImageSrc?: string
}

const HERO_TRUST_POINTS = [
  { icon: CheckCircle2, label: 'Condition checked', description: 'Ready before listing' },
  { icon: Truck, label: 'Local support', description: 'Pickup and dispatch help' },
  { icon: ShieldCheck, label: 'Clear condition', description: 'New, used, or refurbished as listed' },
]

export function HomeHero({
  desktopHeroImageSrc = '/home/hero-desktop.png',
  mobileHeroImageSrc = '/home/hero-mobile.png',
}: HomeHeroProps) {
  const heroImageSrc = desktopHeroImageSrc || mobileHeroImageSrc

  return (
    <section className="relative isolate overflow-hidden py-10 sm:py-14 lg:py-16">
      <div className="absolute inset-0">
        <picture className="absolute inset-0 block h-full w-full">
          {mobileHeroImageSrc ? (
            <source media="(max-width: 767px)" srcSet={mobileHeroImageSrc} />
          ) : null}
          {desktopHeroImageSrc ? (
            <source media="(min-width: 768px)" srcSet={desktopHeroImageSrc} />
          ) : null}
          <img
            src={heroImageSrc}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
        </picture>
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,4,4,0.84)_0%,rgba(0,4,4,0.52)_46%,rgba(0,4,4,0.88)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,100,45,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(13,198,206,0.18),transparent_26%)]" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-black/50 p-5 shadow-2xl backdrop-blur-xl sm:p-6 lg:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80">
            <span className="h-2 w-2 rounded-full bg-mobdeals-red" />
            Selected stock in Nairobi.
          </div>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="space-y-5">
              <p className="text-xs font-medium uppercase tracking-[0.26em] text-white/55">
                Curated tech for Nairobi
              </p>
              <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Curated phones, laptops, and practical tech
                <span className="mt-2 block text-mobdeals-red">for Nairobi</span>
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/74 sm:text-lg">
                Condition checked, tested before listing, and supported on
                WhatsApp when you need to confirm stock.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-mobdeals-red px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-mobdeals-orangeDark"
                >
                  Browse collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={buildWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  <MessageCircle className="h-4 w-4" />
                  Confirm on WhatsApp
                </a>
              </div>

              <p className="text-sm text-white/65">
                Available in Nairobi. Confirm stock and delivery on WhatsApp.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {HERO_TRUST_POINTS.map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08] ring-1 ring-white/10">
                    <feature.icon className="h-4 w-4 text-mobdeals-red" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{feature.label}</p>
                    <p className="text-sm text-white/65">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
