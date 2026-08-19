'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { MapPin, Search, Users, Zap } from 'lucide-react';

export default function Home() {
  const [selectedCity, setSelectedCity] = useState('toronto');
  const [email, setEmail] = useState('');

  const cities = [
    { value: 'toronto', label: 'Toronto' },
    { value: 'mississauga', label: 'Mississauga' },
    { value: 'brampton', label: 'Brampton' },
    { value: 'more', label: 'More cities coming' },
  ];

  const pillars = [
    {
      icon: Zap,
      title: 'Always current',
      description: 'Continuously updated from real community sources',
    },
    {
      icon: MapPin,
      title: 'City by city',
      description: 'Starting in the GTA, built to reach every major community',
    },
    {
      icon: Users,
      title: 'Built for everyone',
      description: 'Every madhhab, background and language welcome',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-soft via-bg to-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="text-2xl font-bold">
            Muslims<span className="text-accent">In</span>Canada.com
          </div>
          <div className="hidden md:flex gap-8 text-sm">
            <Link href="#" className="text-muted hover:text-ink transition">
              Explore
            </Link>
            <Link href="#" className="text-muted hover:text-ink transition">
              About
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-24 space-y-12">
        {/* Eyebrow */}
        <div className="text-center space-y-6">
          <Badge className="bg-accent-soft text-accent border-0 hover:bg-accent hover:text-white">
            Building in the open — launching city by city
          </Badge>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-ink leading-tight">
            The digital home for Canada's Muslim community.
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            Mosques, events, businesses, jobs and community resources — kept current
            automatically, in one trusted place. We're building it starting with the
            GTA.
          </p>
        </div>

        {/* Search Bar */}
        <div className="space-y-6">
          <Link href="/search" className="block">
            <div className="flex items-center gap-3 bg-white rounded-lg shadow-sm p-1 border border-line hover:border-accent transition cursor-pointer">
              <Search className="w-5 h-5 text-muted ml-3" />
              <input
                type="text"
                placeholder="Find a mosque, event, business, or resource near you..."
                className="flex-1 px-4 py-3 bg-transparent outline-none text-ink placeholder-muted"
                readOnly
              />
              <Button className="bg-accent hover:bg-accent/90 text-white rounded-md mr-1">
                Search
              </Button>
            </div>
          </Link>

          {/* City Selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">Viewing:</span>
            <Select value={selectedCity} onValueChange={(value) => value && setSelectedCity(value)}>
              <SelectTrigger className="w-32 border-line">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCity === 'toronto' && (
              <Link
                href="/toronto"
                className="text-sm text-accent hover:underline font-medium"
              >
                Explore Toronto →
              </Link>
            )}
          </div>
        </div>

        {/* Email Signup */}
        <Card className="bg-white border-line p-8 space-y-4">
          <h3 className="font-semibold text-ink">Get notified when we launch in your city</h3>
          <form className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-line flex-1"
            />
            <Button className="bg-accent hover:bg-accent/90 text-white whitespace-nowrap">
              Notify me
            </Button>
          </form>
          <p className="text-xs text-muted">
            No spam. One email when we launch in your city.
          </p>
        </Card>

        {/* Pillars */}
        <div className="grid md:grid-cols-3 gap-6 pt-12">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={i}
                className="bg-white border-line p-6 space-y-3 hover:shadow-md transition"
              >
                <Icon className="w-6 h-6 text-accent" />
                <h3 className="font-semibold text-ink">{pillar.title}</h3>
                <p className="text-sm text-muted">{pillar.description}</p>
              </Card>
            );
          })}
        </div>

        {/* Trust Strip */}
        <div className="text-center py-8 border-t border-b border-line space-y-2">
          <p className="text-sm text-muted">
            <strong className="text-ink">Always current:</strong> Continuously updated from
            real sources like OpenStreetMap and the CRA.
          </p>
          <p className="text-xs text-muted">
            Every listing is verified, dated, and traceable — because trust
            needs to be demonstrated, not assumed.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-12 text-sm text-muted border-t border-line">
        © 2026 MuslimsInCanada.com — in active development.
      </footer>
    </div>
  );
}
