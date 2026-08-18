import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface CityPageProps {
  params: {
    city: string
  }
}

export default async function CityHub({ params }: CityPageProps) {
  // Fetch city data
  const { data: cityData } = await supabase
    .from('city')
    .select('*')
    .eq('slug', params.city)
    .single()

  if (!cityData) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-2xl font-bold">
              Muslims<span className="text-teal-600">In</span>Canada.com
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            City not found
          </h1>
          <p className="mt-2 text-gray-600">
            Return to{' '}
            <Link href="/" className="text-teal-600 hover:underline">
              home
            </Link>
          </p>
        </div>
      </div>
    )
  }

  if (!cityData.is_launched) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-2xl font-bold">
              Muslims<span className="text-teal-600">In</span>Canada.com
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Coming soon to {cityData.name}
          </h1>
          <p className="mt-2 text-gray-600">
            We're building out community resources for {cityData.name}. Check back soon!
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700"
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
    .limit(3)

  const { data: businesses } = await supabase
    .from('business')
    .select('*')
    .eq('city_id', cityData.id)
    .eq('verification_status', 'published')
    .limit(3)

  const { data: events } = await supabase
    .from('event')
    .select('*')
    .eq('city_id', cityData.id)
    .eq('verification_status', 'published')
    .gte('event_date', new Date().toISOString())
    .order('event_date')
    .limit(3)

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-bold">
            Muslims<span className="text-teal-600">In</span>Canada.com
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          {cityData.name}
        </h1>

        {/* City Stats */}
        <div className="mb-12 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            📍 <strong>{mosques?.length || 0}</strong> mosques verified •{' '}
            <strong>{events?.length || 0}</strong> events this week
          </p>
        </div>

        {/* Mosques Section */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Mosques</h2>
            <Link href={`/${params.city}/mosques`} className="text-teal-600 hover:underline">
              See all →
            </Link>
          </div>
          {mosques && mosques.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mosques.map((mosque) => (
                <div key={mosque.id} className="rounded-lg border border-gray-200 p-4">
                  <p className="font-semibold text-gray-900">{mosque.name}</p>
                  <p className="text-sm text-gray-600">{mosque.address}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No mosques listed yet. Be the first to submit one!</p>
          )}
        </section>

        {/* Events Section */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
            <Link href={`/${params.city}/events`} className="text-teal-600 hover:underline">
              See all →
            </Link>
          </div>
          {events && events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="rounded-lg border border-gray-200 p-4">
                  <p className="font-semibold text-gray-900">{event.name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.event_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No events scheduled yet.</p>
          )}
        </section>

        {/* Businesses Section */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Businesses</h2>
            <Link href={`/${params.city}/businesses`} className="text-teal-600 hover:underline">
              See all →
            </Link>
          </div>
          {businesses && businesses.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <div key={business.id} className="rounded-lg border border-gray-200 p-4">
                  <p className="font-semibold text-gray-900">{business.name}</p>
                  <p className="text-sm text-gray-600">{business.category}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No businesses listed yet.</p>
          )}
        </section>

        <div className="text-center">
          <Link
            href="/submit"
            className="inline-block rounded-lg bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700"
          >
            + Submit a listing
          </Link>
        </div>
      </div>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-600">
        © 2026 MuslimsInCanada.com — in active development.
      </footer>
    </main>
  )
}
