import React from 'react';
import type { Metadata } from 'next';
import AdminWorkspace from '@/components/admin/AdminWorkspace';

export const metadata: Metadata = {
  title: 'Admin Dashboard | LastCry Operations',
  robots: { index: false, follow: false },
};

export default function AdminOverviewPage() {
  return <AdminWorkspace activeSection="overview" />;
}
