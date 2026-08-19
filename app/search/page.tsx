'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Search,
  Grid3x3,
  List,
  X,
  Calendar,
  Utensils,
  AlertCircle,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

interface SearchResult {
  id: string;
  type: 'mosque' | 'business' | 'event' | 'organization';
  name: string;
  city: string;
  city_slug: string;
  address?: string;
  category?: string;
  slug: string;
  halal_certified?: boolean;
  is_free?: boolean;
  event_date?: string;
  description?: string;
  is_family_friendly?: boolean;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('toronto');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  const supabase = getSupabase();

  // Load cities
  useEffect(() => {
    const loadCities = async () => {
      const { data } = await supabase
        .from('city')
        .select('id, name, slug')
        .eq('is_launched', true);
      if (data) setCities(data);
    };
    loadCities();
  }, []);

  // Search
  useEffect(() => {
    const searchListings = async () => {
      if (!query.trim() && category === 'all') {
        setResults([]);
        return;
      }

      setLoading(true);
      const searchTerm = query.toLowerCase();

      try {
        // Fetch city
        const { data: cityData } = await supabase
          .from('city')
          .select('id, name, slug')
          .eq('slug', city)
          .single();

        if (!cityData) {
          setResults([]);
          setLoading(false);
          return;
        }

        const allResults: SearchResult[] = [];

        // Search mosques
        if (category === 'all' || category === 'mosque') {
          const { data: mosques } = await supabase
            .from('mosque')
            .select('id, name, address, slug')
            .eq('city_id', cityData.id)
            .eq('verification_status', 'published')
            .or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);

          if (mosques) {
            allResults.push(
              ...mosques.map((m: any) => ({
                id: m.id,
                type: 'mosque' as const,
                name: m.name,
                city: cityData.name,
                city_slug: cityData.slug,
                address: m.address,
                slug: m.slug,
              }))
            );
          }
        }

        // Search businesses
        if (category === 'all' || category === 'business') {
          const { data: businesses } = await supabase
            .from('business')
            .select('id, name, address, category, slug, halal_certified')
            .eq('city_id', cityData.id)
            .eq('verification_status', 'published')
            .or(`name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);

          if (businesses) {
            allResults.push(
              ...businesses.map((b: any) => ({
                id: b.id,
                type: 'business' as const,
                name: b.name,
                city: cityData.name,
                city_slug: cityData.slug,
                address: b.address,
                category: b.category,
                slug: b.slug,
                halal_certified: b.halal_certified,
              }))
            );
          }
        }

        // Search events
        if (category === 'all' || category === 'event') {
          const { data: events } = await supabase
            .from('event')
            .select('id, name, slug, event_date, is_free, is_family_friendly, location_address')
            .eq('city_id', cityData.id)
            .eq('verification_status', 'published')
            .gte('event_date', new Date().toISOString())
            .or(`name.ilike.%${searchTerm}%,location_address.ilike.%${searchTerm}%`);

          if (events) {
            allResults.push(
              ...events.map((e: any) => ({
                id: e.id,
                type: 'event' as const,
                name: e.name,
                city: cityData.name,
                city_slug: cityData.slug,
                address: e.location_address,
                slug: e.slug,
                event_date: e.event_date,
                is_free: e.is_free,
                is_family_friendly: e.is_family_friendly,
              }))
            );
          }
        }

        setResults(allResults.slice(0, 20));
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchListings, 300);
    return () => clearTimeout(timer);
  }, [query, city, category]);

  const getDetailUrl = (result: SearchResult) => {
    const plural = result.type === 'event' ? 'events' : result.type + 's';
    return `/${result.city_slug}/${plural}/${result.slug}`;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      mosque: 'bg-blue-100 text-blue-700',
      business: 'bg-purple-100 text-purple-700',
      event: 'bg-green-100 text-green-700',
      organization: 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-soft via-bg to-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Muslims<span className="text-accent">In</span>Canada.com
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-ink transition">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-ink mb-2">Search</h1>
          <p className="text-lg text-muted mb-8">
            Find mosques, businesses, events, and more in your community
          </p>

          {/* Search Bar */}
          <div className="relative mb-8">
            <div className="flex items-center gap-3 bg-white rounded-lg shadow-sm border border-line p-1">
              <Search className="w-5 h-5 text-muted ml-3" />
              <input
                type="text"
                placeholder="Search by name, category, or keyword..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-4 py-4 bg-transparent outline-none text-ink placeholder-muted"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-muted hover:text-ink mr-3"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="text-sm font-medium text-ink block mb-2">City</label>
              <Select value={city} onValueChange={(v) => v && setCity(v)}>
                <SelectTrigger className="border-line">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-ink block mb-2">Category</label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger className="border-line">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="mosque">Mosques</SelectItem>
                  <SelectItem value="business">Businesses</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 py-2 px-4 rounded-lg border transition flex items-center justify-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-accent text-white border-accent'
                    : 'border-line text-muted hover:text-ink'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 py-2 px-4 rounded-lg border transition flex items-center justify-center gap-2 ${
                  viewMode === 'grid'
                    ? 'bg-accent text-white border-accent'
                    : 'border-line text-muted hover:text-ink'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                Grid
              </button>
            </div>
          </div>

          {/* Results Count */}
          {query || category !== 'all' ? (
            <p className="text-sm text-muted mb-6">
              {loading ? 'Searching...' : `Found ${results.length} result${results.length !== 1 ? 's' : ''}`}
            </p>
          ) : (
            <p className="text-sm text-muted mb-6">Start typing to search</p>
          )}
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {results.map((result) => (
              <Link
                key={result.id}
                href={getDetailUrl(result)}
                className="group"
              >
                <Card
                  className={`bg-white border-line hover:shadow-md transition cursor-pointer h-full ${
                    viewMode === 'grid' ? 'p-6' : 'p-6'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`${getTypeColor(result.type)} border-0`}>
                      {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-ink text-lg mb-2 group-hover:text-accent transition">
                    {result.name}
                  </h3>

                  {result.category && (
                    <p className="text-sm text-muted mb-3">{result.category}</p>
                  )}

                  {result.address && (
                    <div className="flex items-start gap-2 text-sm text-muted mb-4">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{result.address}</span>
                    </div>
                  )}

                  {result.event_date && (
                    <div className="flex items-start gap-2 text-sm text-muted mb-4">
                      <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        {new Date(result.event_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {result.halal_certified && (
                      <Badge className="bg-green-100 text-green-700 border-0 text-xs flex items-center gap-1">
                        <Utensils className="w-3 h-3" />
                        Halal
                      </Badge>
                    )}
                    {result.is_free && (
                      <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">Free</Badge>
                    )}
                    {result.is_family_friendly && (
                      <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">Family-friendly</Badge>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : query || category !== 'all' ? (
          <Card className="bg-white border-line p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-lg text-muted mb-2">No results found</p>
            <p className="text-sm text-muted">
              Try adjusting your search terms or filters
            </p>
          </Card>
        ) : (
          <Card className="bg-white border-line p-12 text-center">
            <Search className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-lg text-muted">Start searching</p>
            <p className="text-sm text-muted">
              Enter a keyword to find mosques, businesses, events, and more
            </p>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-line text-center py-12 text-sm text-muted mt-24">
        © 2026 MuslimsInCanada.com — in active development.
      </footer>
    </div>
  );
}
