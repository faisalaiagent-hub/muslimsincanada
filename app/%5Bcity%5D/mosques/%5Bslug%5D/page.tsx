import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Globe, Clock, Users, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface MosqueDetailPageProps {
  params: {
    city: string
    slug: string
  }
}

export default async function MosqueDetailPage({ params }: MosqueDetailPageProps) {
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

  // Fetch mosque by slug
  const { data: mosque } = await supabase
    .from('mosque')
    .select('*')
    .eq('city_id', cityData.id)
    .eq('slug', params.slug)
    .eq('verification_status', 'published')
    .single()

  if (!mosque) {
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
          <h1 className="text-4xl font-bold text-ink mb-4">Mosque not found</h1>
          <Link href={`/${params.city}`} className="text-accent hover:underline">
            Back to {cityData.name}
          </Link>
        </div>
      </div>
    )
  }

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
              <h1 className="text-5xl font-bold text-ink mb-4">{mosque.name}</h1>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-accent-soft text-accent border-0">
                  Verified
                </Badge>
                {mosque.has_womens_section && (
                  <Badge className="bg-accent-soft text-accent border-0">
                    Women's section
                  </Badge>
                )}
                {mosque.has_wheelchair_access && (
                  <Badge className="bg-accent-soft text-accent border-0">
                    Wheelchair accessible
                  </Badge>
                )}
                {mosque.has_parking && (
                  <Badge className="bg-accent-soft text-accent border-0">
                    Parking available
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-white border-line p-8">
              <h2 className="text-lg font-semibold text-ink mb-6">Location & Contact</h2>
              <div className="space-y-4">
                {mosque.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted">Address</p>
                      <p className="text-ink font-medium">{mosque.address}</p>
                    </div>
                  </div>
                )}
                {mosque.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted">Phone</p>
                      <a href={`tel:${mosque.phone}`} className="text-accent hover:underline font-medium">
                        {mosque.phone}
                      </a>
                    </div>
                  </div>
                )}
                {mosque.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted">Website</p>
                      <a
                        href={mosque.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline font-medium break-all"
                      >
                        {new URL(mosque.website).hostname}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Prayer Times */}
            <Card className="bg-white border-line p-8">
              <h2 className="text-lg font-semibold text-ink mb-6">Prayer Times</h2>
              <div className="space-y-3">
                {[
                  { name: 'Fajr', time: mosque.prayer_fajr },
                  { name: 'Dhuhr', time: mosque.prayer_dhuhr },
                  { name: 'Asr', time: mosque.prayer_asr },
                  { name: 'Maghrib', time: mosque.prayer_maghrib },
                  { name: 'Isha', time: mosque.prayer_isha },
                  { name: 'Jumu\'ah', time: mosque.prayer_jummah },
                ].map(({ name, time }) => (
                  <div key={name} className="flex justify-between items-center text-sm">
                    <span className="text-muted">{name}</span>
                    <span className="font-medium text-ink">
                      {time || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* About Section */}
          {mosque.description && (
            <Card className="bg-white border-line p-8 mb-12">
              <h2 className="text-lg font-semibold text-ink mb-4">About</h2>
              <p className="text-muted leading-relaxed">{mosque.description}</p>
            </Card>
          )}

          {/* Facilities */}
          <Card className="bg-white border-line p-8 mb-12">
            <h2 className="text-lg font-semibold text-ink mb-6">Facilities</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Users, label: 'Women\'s section', value: mosque.has_womens_section },
                { icon: Users, label: 'Men\'s section', value: true },
                { icon: MapPin, label: 'Wheelchair accessible', value: mosque.has_wheelchair_access },
                { icon: MapPin, label: 'Parking', value: mosque.has_parking },
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
          <Card className="bg-accent-soft border-accent/20 p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-ink mb-2">Data & Verification</h3>
                <p className="text-sm text-muted mb-3">
                  This listing is verified and kept current. Information comes from{' '}
                  <strong>OpenStreetMap</strong> and confirmed through official sources.
                </p>
                <div className="text-xs text-muted space-y-1">
                  <p>
                    <strong>Last verified:</strong>{' '}
                    {new Date(mosque.updated_at || mosque.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p>
                    <strong>Confidence:</strong> {Math.round((mosque.confidence_score || 0) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-4 mt-12">
            <Button className="bg-accent hover:bg-accent/90 text-white py-3">
              Report incorrect info
            </Button>
            <Button className="border border-line text-ink bg-white hover:bg-gray-50 py-3">
              Is this your mosque?
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
