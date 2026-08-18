import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">
            Muslims<span className="text-teal-600">In</span>Canada.com
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="text-center">
          <div className="mb-4 inline-block rounded-full bg-teal-50 px-3 py-1">
            <span className="text-sm font-semibold text-teal-600">
              Building in the open — launching city by city
            </span>
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            The digital home for Canada's Muslim community.
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
            Mosques, events, businesses, jobs and community resources — kept current automatically, in one trusted place. We're building it starting with the GTA.
          </p>

          <div className="mb-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <input
              type="email"
              placeholder="you@email.com"
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm"
              required
            />
            <button className="rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700">
              Notify me
            </button>
          </div>
          <p className="mb-8 text-sm text-gray-500">
            No spam. One email when we launch in your city.
          </p>

          <div className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <p className="font-semibold text-gray-900">Always current</p>
              <p className="text-sm text-gray-600">
                Continuously updated from real community sources
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">City by city</p>
              <p className="text-sm text-gray-600">
                Starting in the GTA, built to reach every major community
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Built for everyone</p>
              <p className="text-sm text-gray-600">
                Every madhhab, background and language welcome
              </p>
            </div>
          </div>

          <Link
            href="/toronto"
            className="inline-block rounded-lg bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-200"
          >
            Explore Toronto →
          </Link>
        </section>
      </div>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-600">
        © 2026 MuslimsInCanada.com — in active development.
      </footer>
    </main>
  )
}
