'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui';

interface Place {
  title: string;
  subtitle: string;
  address: string;
  mapsUrl: string;
  photo: string; // /public path; falls back to a placeholder if missing
}

// Fixed points the drivers need often. Edit here.
const PLACES: Place[] = [
  {
    title: 'Warehouse / Bunker',
    subtitle: "Brandon's Shredding Boxes",
    address: 'Bibra Lake WA (−32.1175347, 115.8388211)',
    mapsUrl: 'https://maps.app.goo.gl/TYAe3zykkA4a88Qb8',
    photo: '/mapping/warehouse.jpg',
  },
  {
    title: "Brandon's Home",
    subtitle: 'North Lake',
    address: '19 Westerway Terrace, North Lake WA 6163',
    mapsUrl: 'https://maps.app.goo.gl/BNGKgX3RByeDv9k69',
    photo: '/mapping/home.jpg',
  },
];

export default function MappingPage() {
  return (
    <div className="flex flex-col gap-stack-gap pt-4">
      <h2 className="text-headline-md text-primary">Mapping</h2>
      {PLACES.map((p) => (
        <PlaceCard key={p.title} place={p} />
      ))}
    </div>
  );
}

function PlaceCard({ place }: { place: Place }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border-2 border-outline-variant bg-surface-container-lowest shadow-lg">
      <div className="relative h-44 bg-surface-variant">
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon name="photo_camera" className="text-5xl text-outline" />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={place.photo}
          alt=""
          onLoad={() => setLoaded(true)}
          className={`relative h-full w-full object-cover transition-opacity ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
      <div className="p-card-padding">
        <h3 className="text-headline-sm text-primary">{place.title}</h3>
        <p className="text-body-md text-on-surface-variant">{place.subtitle}</p>
        <p className="mt-1 flex items-start gap-2 text-body-md text-on-surface">
          <Icon name="location_on" className="mt-0.5 text-lg text-secondary" />
          {place.address}
        </p>
        <a
          href={place.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-label-lg uppercase tracking-wide text-on-secondary active:scale-[0.98]"
        >
          <Icon name="directions" className="text-lg" />
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
