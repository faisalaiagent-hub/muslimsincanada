import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Globe, Clock, Utensils, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface BusinessDetailPageProps {
  params: {
    city: string
    slug: string
  }
}

export default async function BusinessDetailPage({ params }: BusinessDetailPageProps) {
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

  // Fetch business by slug
  const { data: business } = await supabase
    .from('business')
    .select('*')
    .eq('city_id', cityData.id)
    .eq('slug', params.slug)
    .eq('verification_status', 'published')
    .single()

  if (!business) {
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
          <h1 className="text-4xl font-bold text-ink mb-4">Business not found</h1>
          <Link href={`/${params.city}`} className="text-accent hover:underline">
            Back to {cityData.name}
          </Link>
        </div>
      </div>
    )
  }

  // Fetch halal certifier if certified
  let certifierData = null
  if (business.halal_certified && business.halal_certifier_id) {
    const { data } = await supabase
      .from('halal_certifier')
      .select('*')
      .eq('id', business.halal_certifier_id)
      .single()
    certifierData = data
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
              <h1 className="text-5xl font-bold text-ink mb-4">{business.name}</h1>
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge className="bg-accent-soft text-accent border-0">
                  {business.category}
                </Badge>
                {business.is_muslim_owned && (
                  <Badge className="bg-accent-soft text-accent border-0">
                    Muslim-owned
                  </Badge>
                )}
                {business.halal_certified && (
                  <Badge className="bg-green-100 text-green-700 border-0 flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Halal Certified
                  </Badge>
                )}
              </div>
              {business.description && (
                <p className="text-lg text-muted">{business.description}</p>
              )}
            </div>
          </div>

          {/* Contact & Hours */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-white border-line p-8">
              <h2 className="text-lg font-semibold text-ink mb-6">Location & Contact</h2>
              <div className="space-y-4">
                {business.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted">Address</p>
                      <p className="text-ink font-medium">{business.address}</p>
                    </div>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted">Phone</p>
                      <a href={`tel:${business.phone}`} className="text-accent hover:underline font-medium">
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted">Website</p>
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline font-medium break-all"
                      >
                        {new URL(business.website).hostname}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Hours */}
            {business.hours && (
              <Card className="bg-white border-line p-8">
                <h2 className="text-lg font-semibold text-ink mb-6">Hours</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Hours of operation</span>
                  </div>
                  <p className="text-ink font-medium whitespace-pre-line">{business.hours}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Halal Certification Details */}
          {business.halal_certified && certifierData && (
            <Card className="bg-green-50 border-green-200 p-8 mb-12">
              <div className="flex items-start gap-4">
                <Utensils className="w-6 h-6 text-green-700 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Halal Certified</h3>
                  <p className="text-green-800 mb-3">
                    This business is certified halal by <strong>{certifierData.name}</strong>
                  </p>
                  {certifierData.website && (
                    <a
                      href={certifierData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 hover:underline text-sm font-medium"
                    >
                      View certifier info →
                    </a>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Data Source & Verification */}
          <Card className="bg-accent-soft border-accent/20 p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-ink mb-2">Data & Verification</h3>
                <p className="text-sm text-muted mb-3">
                  This listing is verified and kept current from public business registries and community submissions.
                </p>
                <div className="text-xs text-muted space-y-1">
                  <p>
                    <strong>Last verified:</strong>{' '}
                    {new Date(business.updated_at || business.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p>
                    <strong>Confidence:</strong> {Math.round((business.confidence_score || 0) * 100)}%
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
              Suggest a correction
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
