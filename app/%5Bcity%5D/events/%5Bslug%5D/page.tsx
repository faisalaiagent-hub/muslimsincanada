import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Clock, Users, Globe, AlertCircle, Share2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface EventDetailPageProps {
  params: {
    city: string
    slug: string
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const supabase = getSupabase()

  // Fetch city
  const { data: cityData } = await supabase
    .from('city')
    .select('*')
    .eq('slug', params.city)
    .single()

  if (!cityData) {
    return (
      <div className="min-h-screen bg-bg">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-line">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <Link href="/" className="text-2xl font-bold">
              Muslims<span className="text-accent">In</span>Canada.com
            </Link>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl font-bold text-ink mb-4">City not found</h1>
          <Link href="/" className="text-accent hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  // Fetch event by slug
  const { data: event } = await supabase
    .from('event')
    .select('*')
    .eq('city_id', cityData.id)
    .eq('slug', params.slug)
    .eq('verification_status', 'published')
    .single()

  if (!event) {
    return (
      <div className="min-h-screen bg-bg">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-line">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <Link href="/" className="text-2xl font-bold">
              Muslims<span className="text-accent">In</span>Canada.com
            </Link>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl font-bold text-ink mb-4">Event not found</h1>
          <Link href={`/${params.city}`} className="text-accent hover:underline">
            Back to {cityData.name}
          </Link>
        </div>
      </div>
    )
  }

  const eventDate = new Date(event.event_date)
  const isPast = eventDate < new Date()

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-soft via-bg to-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-line">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href={`/${params.city}`} className="text-accent hover:underline text-sm font-medium">
            ← Back to {cityData.name}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex flex-wrap gap-3 mb-4">
                {isPast && (
                  <Badge className="bg-gray-100 text-gray-700 border-0">Past Event</Badge>
                )}
                {event.is_family_friendly && (
                  <Badge className="bg-accent-soft text-accent border-0">Family-friendly</Badge>
                )}
                {event.is_gender_specific && (
                  <Badge className="bg-accent-soft text-accent border-0">Gender-specific</Badge>
                )}
                {event.is_free && (
                  <Badge className="bg-green-100 text-green-700 border-0">Free</Badge>
                )}
              </div>
              <h1 className="text-5xl font-bold text-ink mb-4">{event.name}</h1>
              {event.description && (
                <p className="text-lg text-muted max-w-2xl">{event.description}</p>
              )}
            </div>
          </div>

          {/* Date & Location */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-white border-line p-8">
              <h2 className="text-lg font-semibold text-ink mb-6">Date & Time</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted">Date</p>
                    <p className="text-ink font-medium">
                      {eventDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted">Time</p>
                    <p className="text-ink font-medium">
                      {eventDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white border-line p-8">
              <h2 className="text-lg font-semibold text-ink mb-6">Location</h2>
              <div className="space-y-4">
                {event.is_online ? (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted">Format</p>
                      <p className="text-ink font-medium">Online Event</p>
                      {event.online_url && (
                        <a
                          href={event.online_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline text-sm mt-2 block"
                        >
                          Join online →
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted">Venue</p>
                        <p className="text-ink font-medium">{event.location_name || event.location_address}</p>
                        {event.location_address && (
                          <p className="text-sm text-muted mt-1">{event.location_address}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* About Event */}
          {event.description && (
            <Card className="bg-white border-line p-8 mb-12">
              <h2 className="text-lg font-semibold text-ink mb-4">About This Event</h2>
              <p className="text-muted leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </Card>
          )}

          {/* Event Details */}
          <Card className="bg-white border-line p-8 mb-12">
            <h2 className="text-lg font-semibold text-ink mb-6">Event Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Users, label: 'Family-friendly', value: event.is_family_friendly },
                { icon: Users, label: 'Gender-specific', value: event.is_gender_specific },
                { icon: Users, label: 'Requires registration', value: event.requires_registration },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${value ? 'text-accent' : 'text-line'}`} />
                  <span className={value ? 'text-ink' : 'text-muted'}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Data Source & Verification */}
          <Card className="bg-accent-soft border-accent/20 p-8 mb-12">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-ink mb-2">Event Information</h3>
                <p className="text-sm text-muted mb-3">
                  Event details from community organizers and public calendars, verified and kept current.
                </p>
                <div className="text-xs text-muted space-y-1">
                  <p>
                    <strong>Last verified:</strong>{' '}
                    {new Date(event.updated_at || event.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p>
                    <strong>Confidence:</strong> {Math.round((event.confidence_score || 0) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <Button className="bg-accent hover:bg-accent/90 text-white py-3 flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Add to Calendar
            </Button>
            <Button className="border border-line text-ink bg-white hover:bg-gray-50 py-3 flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Event
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-line text-center py-12 text-sm text-muted">
        © 2026 MuslimsInCanada.com — in active development.
      </footer>
    </div>
  )
}
