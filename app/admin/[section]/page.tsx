import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AdminWorkspace, { AdminSectionSlug } from '@/components/admin/AdminWorkspace';

export const metadata: Metadata = {
  title: 'Admin Console | LastCry Operations',
  robots: { index: false, follow: false },
};

const VALID_SECTIONS: AdminSectionSlug[] = [
  'products',
  'categories',
  'orders',
  'inventory',
  'suppliers',
  'delivery-zones',
  'customers',
  'service-providers',
  'content',
  'coupons',
  'reviews',
  'support',
  'settings',
  'audit-logs',
];

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!VALID_SECTIONS.includes(section as AdminSectionSlug)) {
    notFound();
  }
  return <AdminWorkspace activeSection={section as AdminSectionSlug} />;
}
