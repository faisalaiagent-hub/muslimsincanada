import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface CityPageProps {
  params: {
    city: string
  }
}

export default async function CityHub({ params }: CityPageProps) {
  const supabase = getSupabase()

  // Fetch city data
  const { data: cityData } = await supabase
    .from('city')
    .select('*')
    .eq('slug', params.city)
    .single()

  if (!cityData) {
    return (
      <div className="min-h-screen bg-bg">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-line">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Link href="/" className="text-2xl font-bold">
              Muslims<span className="text-accent">In</span>Canada.com
            </Link>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl font-bold text-ink mb-4">City not found</h1>
          <p className="text-muted mb-8">
            Return to{' '}
            <Link href="/" className="text-accent hover:underline font-medium">
              home
            </Link>
          </p>
        </div>
      </div>
    )
  }

  if (!cityData.is_launched) {
    return (
      <div className="min-h-screen bg-bg">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-line">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Link href="/" className="text-2xl font-bold">
              Muslims<span className="text-accent">In</span>Canada.com
            </Link>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl font-bold text-ink mb-4">
            Coming soon to {cityData.name}
          </h1>
          <p className="text-muted mb-8">
            We're building out community resources for {cityData.name}. Check back soon!
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-accent text-white px-6 py-3 font-semibold hover:bg-accent/90"
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  // Fetch mosques, businesses, events for this city
  const { data: mosques } = await supabase
    .from('mosque')
    .select('*')
    .eq('city_id', cityData.id)
    .eq('verification_status', 'published')
    .limit(6)

  const { data: businesses } = await supabase
    .from('business')
    .select('*')
    .eq('city_id', cityData.id)
    .eq('verification_status', 'published')
    .limit(6)

  const { data: events } = await supabase
    .from('event')
    .select('*')
    .eq('city_id', cityData.id)
    .eq('verification_status', 'published')
    .gte('event_date', new Date().toISOString())
    .order('event_date')
    .limit(6)

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-soft via-bg to-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Muslims<span className="text-accent">In</span>Canada.com
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-ink transition">
            ← Back to cities
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="space-y-2 mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-ink">{cityData.name}</h1>
          <p className="text-lg text-muted">Mosques, events, and community resources</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          <Card className="bg-white border-line p-6">
            <div className="text-3xl font-bold text-accent mb-2">{mosques?.length || 0}</div>
            <p className="text-sm text-muted">Mosques verified</p>
          </Card>
          <Card className="bg-white border-line p-6">
            <div className="text-3xl font-bold text-accent mb-2">{events?.length || 0}</div>
            <p className="text-sm text-muted">Upcoming events</p>
          </Card>
          <Card className="bg-white border-line p-6">
            <div className="text-3xl font-bold text-accent mb-2">{businesses?.length || 0}</div>
            <p className="text-sm text-muted">Businesses & services</p>
          </Card>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pb-24 space-y-20">
        {/* Mosques Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-ink">Mosques</h2>
            <Link href={`/${params.city}/mosques`} className="text-accent hover:underline font-medium">
              View all →
            </Link>
          </div>
          {mosques && mosques.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mosques.map((mosque) => (
                <Card key={mosque.id} className="bg-white border-line p-6 hover:shadow-md transition">
                  <h3 className="font-semibold text-ink mb-3 text-lg">{mosque.name}</h3>
                  <div className="flex items-start gap-2 text-sm text-muted mb-4">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{mosque.address}</span>
                  </div>
                  <Badge className="bg-accent-soft text-accent border-0">
                    Verified
                  </Badge>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white border-line p-12 text-center">
              <p className="text-muted">No mosques listed yet. Be the first to submit one!</p>
            </Card>
          )}
        </section>

        {/* Events Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-ink">Upcoming Events</h2>
            <Link href={`/${params.city}/events`} className="text-accent hover:underline font-medium">
              View all →
            </Link>
          </div>
          {events && events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className="bg-white border-line p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-ink text-lg mb-2">{event.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.event_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                    {event.is_free && <Badge className="bg-accent-soft text-accent border-0">Free</Badge>}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white border-line p-12 text-center">
              <p className="text-muted">No events scheduled yet.</p>
            </Card>
          )}
        </section>

        {/* Businesses Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-ink">Businesses & Services</h2>
            <Link href={`/${params.city}/businesses`} className="text-accent hover:underline font-medium">
              View all →
            </Link>
          </div>
          {businesses && businesses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <Card key={business.id} className="bg-white border-line p-6 hover:shadow-md transition">
                  <h3 className="font-semibold text-ink mb-2 text-lg">{business.name}</h3>
                  <p className="text-sm text-muted mb-4">{business.category}</p>
                  {business.address && (
                    <div className="flex items-start gap-2 text-sm text-muted">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{business.address}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white border-line p-12 text-center">
              <p className="text-muted">No businesses listed yet.</p>
            </Card>
          )}
        </section>

        {/* CTA */}
        <div className="text-center py-12 border-t border-line">
          <h3 className="text-2xl font-bold text-ink mb-4">Know a mosque, business, or event?</h3>
          <Link
            href="/submit"
            className="inline-block rounded-lg bg-accent text-white px-8 py-4 font-semibold hover:bg-accent/90 transition"
          >
            + Submit a listing
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-line text-center py-12 text-sm text-muted">
        © 2026 MuslimsInCanada.com — in active development.
      </footer>
    </div>
  )
}
