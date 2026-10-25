import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedRitualKits } from '@/lib/db/store';
import RitualKitBuilderClient from '@/components/shop/RitualKitBuilderClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kit = getPublishedRitualKits().find((k) => k.slug === slug);
  if (!kit) {
    return { title: 'Ritual Kit Not Found | LastCry' };
  }
  return {
    title: `${kit.name} — Ritual Kit Builder | LastCry`,
    description: kit.shortDescription,
    alternates: {
      canonical: `/ritual-kits/${kit.slug}`,
    },
  };
}

export default async function RitualKitDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const allKits = getPublishedRitualKits();
  const kit = allKits.find((k) => k.slug === slug);

  if (!kit) {
    notFound();
  }

  return <RitualKitBuilderClient kit={kit} allKits={allKits} />;
}
