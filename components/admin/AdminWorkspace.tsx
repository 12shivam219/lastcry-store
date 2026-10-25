'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Lock,
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Boxes,
  Truck,
  MapPin,
  Users,
  Compass,
  FileText,
  Tag,
  MessageSquare,
  LifeBuoy,
  Settings,
  ClipboardList,
  RotateCcw,
  LogOut,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Download,
} from 'lucide-react';
import {
  RoleType,
  ProductRecord,
  CategoryRecord,
  RitualKitRecord,
  OrderRecord,
  SupplierRecord,
  DeliveryZoneRecord,
  CouponRecord,
  ServiceListingRecord,
  ServiceEnquiryRecord,
  GuidanceArticleRecord,
  SupportTicketRecord,
  UserAccountRecord,
  AuditLogRecord,
  OrderStatus,
} from '@/lib/db/types';

export type AdminSectionSlug =
  | 'overview'
  | 'products'
  | 'categories'
  | 'orders'
  | 'inventory'
  | 'suppliers'
  | 'delivery-zones'
  | 'customers'
  | 'service-providers'
  | 'content'
  | 'coupons'
  | 'reviews'
  | 'support'
  | 'settings'
  | 'audit-logs';

interface AdminPayload {
  metrics: {
    totalOrders: number;
    awaitingProcessing: number;
    totalRevenueInr: number;
    pendingFulfilment: number;
    lowStockCount: number;
    pendingRefundsCount: number;
  };
  products: ProductRecord[];
  categories: CategoryRecord[];
  ritualKits: RitualKitRecord[];
  orders: OrderRecord[];
  suppliers: SupplierRecord[];
  deliveryZones: DeliveryZoneRecord[];
  coupons: CouponRecord[];
  serviceListings: ServiceListingRecord[];
  serviceEnquiries: ServiceEnquiryRecord[];
  guidanceArticles: GuidanceArticleRecord[];
  supportTickets: SupportTicketRecord[];
  users: Omit<UserAccountRecord, 'passwordHash'>[];
  auditLogs: AuditLogRecord[];
}

const NAV_ITEMS: {
  slug: AdminSectionSlug;
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { slug: 'overview', href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { slug: 'products', href: '/admin/products', label: 'Products', icon: Package },
  { slug: 'categories', href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { slug: 'orders', href: '/admin/orders', label: 'Orders & Refunds', icon: ShoppingCart },
  { slug: 'inventory', href: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { slug: 'suppliers', href: '/admin/suppliers', label: 'Suppliers', icon: Truck },
  { slug: 'delivery-zones', href: '/admin/delivery-zones', label: 'Delivery Zones', icon: MapPin },
  { slug: 'customers', href: '/admin/customers', label: 'Customers', icon: Users },
  {
    slug: 'service-providers',
    href: '/admin/service-providers',
    label: 'Service Directory',
    icon: Compass,
  },
  { slug: 'content', href: '/admin/content', label: 'Content & Kits', icon: FileText },
  { slug: 'coupons', href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { slug: 'reviews', href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { slug: 'support', href: '/admin/support', label: 'Support & Grievances', icon: LifeBuoy },
  { slug: 'settings', href: '/admin/settings', label: 'Settings & Seed', icon: Settings },
  { slug: 'audit-logs', href: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList },
];

export default function AdminWorkspace({
  activeSection,
}: {
  activeSection: AdminSectionSlug;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@lastcry.in');
  const [adminRole, setAdminRole] = useState<RoleType>('ADMIN');
  const [passphrase, setPassphrase] = useState('lastcry-sandbox-admin-2026');
  const [authError, setAuthError] = useState<string | null>(null);

  const [data, setData] = useState<AdminPayload | null>(null);
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('850');
  const [newProdStock, setNewProdStock] = useState('25');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Order Filter State
  const [orderSearch, setOrderSearch] = useState('');

  const fetchAdminData = useCallback(
    async (roleOverride?: RoleType, emailOverride?: string) => {
      try {
        const res = await fetch('/api/admin', {
          headers: {
            'x-admin-role': roleOverride || adminRole,
            'x-admin-email': emailOverride || adminEmail,
          },
        });
        if (res.status === 401) {
          setIsAuthenticated(false);
          setCheckingAuth(false);
          return;
        }
        const json = await res.json();
        setData(json);
        setIsAuthenticated(true);
        setCheckingAuth(false);
      } catch {
        setCheckingAuth(false);
      }
    },
    [adminRole, adminEmail]
  );

  useEffect(() => {
    let savedSession: string | null = null;
    let savedRole: RoleType = 'ADMIN';
    let savedEmail = 'admin@lastcry.in';
    try {
      savedSession = sessionStorage.getItem('lastcry_admin_unlocked');
      savedRole = (sessionStorage.getItem('lastcry_admin_role') as RoleType) || 'ADMIN';
      savedEmail = sessionStorage.getItem('lastcry_admin_email') || 'admin@lastcry.in';
    } catch {
      // Ignore
    }
    if (savedSession !== 'true') return;

    let cancelled = false;
    fetch('/api/admin', {
      headers: {
        'x-admin-role': savedRole,
        'x-admin-email': savedEmail,
      },
    })
      .then((res) => (res.status === 401 ? null : res.json()))
      .then((json) => {
        if (cancelled || !json) return;
        setAdminRole(savedRole);
        setAdminEmail(savedEmail);
        setData(json);
        setIsAuthenticated(true);
      })
      .catch(() => {
        // Ignore
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ADMIN_LOGIN',
        email: adminEmail,
        passphrase,
        role: adminRole,
      }),
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      setAuthError(result.error || 'Authentication failed.');
      return;
    }
    try {
      sessionStorage.setItem('lastcry_admin_unlocked', 'true');
      sessionStorage.setItem('lastcry_admin_role', adminRole);
      sessionStorage.setItem('lastcry_admin_email', adminEmail);
    } catch {
      // Ignore
    }
    await fetchAdminData(adminRole, adminEmail);
  };

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ADMIN_LOGOUT' }),
    });
    try {
      sessionStorage.removeItem('lastcry_admin_unlocked');
    } catch {
      // Ignore
    }
    setIsAuthenticated(false);
    setData(null);
  };

  const runAdminMutation = async (payload: Record<string, unknown>, successMsg: string) => {
    setActionBanner(null);
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-role': adminRole,
        'x-admin-email': adminEmail,
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      setActionBanner(`Error: ${json.error || 'Operation failed'}`);
      return;
    }
    setActionBanner(successMsg);
    await fetchAdminData();
  };

  const exportOrdersCsv = () => {
    if (!data) return;
    const headers = [
      'OrderNumber',
      'Date',
      'CustomerEmail',
      'PinCode',
      'OrderStatus',
      'PaymentStatus',
      'FulfilmentStatus',
      'TotalINR',
    ];
    const rows = data.orders.map((o) => [
      o.orderNumber,
      o.createdAt,
      o.customerEmail,
      o.shippingAddress.pinCode,
      o.orderStatus,
      o.paymentStatus,
      o.fulfilmentStatus,
      o.totalInr,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lastcry-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F1EA] text-xs text-[#5C5852]">
        Verifying administrative session...
      </div>
    );
  }

  // Protected Authentication Gate for Unauthorized Users
  if (!isAuthenticated || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F1EA] p-4">
        <div className="w-full max-w-md rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#2E473B] text-[#FAF8F5]">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <h1 className="font-serif text-xl font-semibold text-[#1C1B19]">
                  LastCry Admin &amp; Operations
                </h1>
                <p className="text-[11px] text-[#6E6A63]">
                  Protected Role-Based Access Control Gate
                </p>
              </div>
            </div>
            <Link href="/" className="text-xs text-[#2E473B] underline">
              Storefront
            </Link>
          </div>

          <p className="text-xs leading-relaxed text-[#4E4B45]">
            Administrative interfaces, cost prices, supplier contracts, and customer order records are restricted to authorized personnel.
          </p>

          {authError && (
            <div
              role="alert"
              className="rounded border border-[#D99B8C] bg-[#FDF2EF] p-3 text-xs text-[#8C3B2B]"
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label htmlFor="adm-email" className="block font-medium text-[#1C1B19] mb-1">
                Administrator Email
              </label>
              <input
                id="adm-email"
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="adm-role" className="block font-medium text-[#1C1B19] mb-1">
                RBAC Role Assignment
              </label>
              <select
                id="adm-role"
                value={adminRole}
                onChange={(e) => setAdminRole(e.target.value as RoleType)}
                className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2"
              >
                <option value="ADMIN">ADMIN (Full Operations &amp; Finance)</option>
                <option value="OPERATIONS_MANAGER">
                  OPERATIONS_MANAGER (Inventory &amp; Orders — No Refund Approval)
                </option>
                <option value="CONTENT_REVIEWER">
                  CONTENT_REVIEWER (Cultural Review &amp; Content Only)
                </option>
                <option value="FINANCE_AUDITOR">
                  FINANCE_AUDITOR (Refunds &amp; Audit Logs)
                </option>
              </select>
            </div>

            <div>
              <label htmlFor="adm-token" className="block font-medium text-[#1C1B19] mb-1">
                Admin Bootstrap Token / Passphrase
              </label>
              <input
                id="adm-token"
                type="password"
                required
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full rounded border border-[#CFC7B8] bg-white px-3 py-2 font-mono"
              />
              <p className="mt-1 text-[11px] text-[#6E6A63]">
                Local dev bootstrap token: <code>lastcry-sandbox-admin-2026</code> (Configured via{' '}
                <code>ADMIN_BOOTSTRAP_TOKEN</code>)
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-[#2E473B] px-4 py-2.5 font-medium text-[#FAF8F5] hover:bg-[#23372D]"
            >
              Authenticate Admin Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F4F1EA] text-[#1C1B19]">
      {/* Sidebar Navigation (250px Workspace Canvas) */}
      <aside className="w-64 shrink-0 border-r border-[#DFD8CC] bg-[#FAF8F5] flex flex-col justify-between">
        <div className="p-4 space-y-5">
          <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3.5 px-2">
            <div>
              <Link href="/admin" className="font-serif text-xl font-semibold text-[#1C1B19]">
                LastCry Admin
              </Link>
              <p className="text-[11px] font-mono text-[#2E473B]">{adminRole}</p>
            </div>
            <Link
              href="/"
              className="rounded border border-[#DFD8CC] px-2 py-1 text-[11px] text-[#5C5852] hover:text-[#1C1B19]"
            >
              Store
            </Link>
          </div>

          <nav aria-label="Admin Navigation" className="space-y-0.5 text-xs">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.slug === activeSection;
              return (
                <Link
                  key={item.slug}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 transition-colors ${
                    isActive
                      ? 'bg-[#2E473B] text-[#FAF8F5] font-medium'
                      : 'text-[#4E4B45] hover:bg-[#EFEBE2] hover:text-[#1C1B19]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#E5DEC9] p-4 space-y-2 text-xs">
          <p className="truncate font-mono text-[11px] text-[#6E6A63]">{adminEmail}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded border border-[#CFC7B8] bg-white px-3 py-1.5 text-xs text-[#3A3732] hover:bg-[#EFEBE2]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Lock Admin Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Workspace Header */}
        <header className="flex items-center justify-between gap-4 border-b border-[#DFD8CC] bg-[#FAF8F5] px-6 py-3.5">
          <div className="text-xs text-[#5C5852] flex items-center gap-2">
            <span>Admin Workspace</span>
            <span>/</span>
            <strong className="text-[#1C1B19] capitalize">
              {activeSection.replace(/-/g, ' ')}
            </strong>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={exportOrdersCsv}
              className="inline-flex items-center gap-1.5 rounded border border-[#DFD8CC] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1B19] hover:border-[#2E473B] whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Orders CSV</span>
            </button>

            <button
              type="button"
              onClick={() =>
                runAdminMutation(
                  { action: 'RESET_SEED_DATA' },
                  'Development seed data reset to baseline.'
                )
              }
              className="inline-flex items-center gap-1.5 rounded bg-[#1C1B19] px-3 py-1.5 text-xs font-medium text-[#FAF8F5] hover:bg-[#3A3732] whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Seed Data</span>
            </button>
          </div>
        </header>

        <main className="p-6 space-y-6 overflow-x-auto">
          {actionBanner && (
            <div
              role="status"
              className={`rounded-md border px-4 py-3 text-xs flex items-center justify-between ${
                actionBanner.startsWith('Error:')
                  ? 'border-[#D99B8C] bg-[#FDF2EF] text-[#8C3B2B]'
                  : 'border-[#2E473B] bg-[#EFEBE2] text-[#1C1B19]'
              }`}
            >
              <span>{actionBanner}</span>
              <button
                type="button"
                onClick={() => setActionBanner(null)}
                className="underline ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* SECTION 1: OVERVIEW */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                {[
                  {
                    label: 'Total Orders',
                    val: data.metrics.totalOrders.toString(),
                  },
                  {
                    label: 'Awaiting Processing',
                    val: data.metrics.awaitingProcessing.toString(),
                  },
                  {
                    label: 'Paid Order Revenue',
                    val: `₹${data.metrics.totalRevenueInr.toLocaleString('en-IN')}`,
                  },
                  {
                    label: 'Pending Fulfilment',
                    val: data.metrics.pendingFulfilment.toString(),
                  },
                  {
                    label: 'Low-Stock Items',
                    val: data.metrics.lowStockCount.toString(),
                  },
                  {
                    label: 'Pending Refunds',
                    val: data.metrics.pendingRefundsCount.toString(),
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-4 space-y-1"
                  >
                    <p className="text-[11px] text-[#6E6A63]">{stat.label}</p>
                    <p className="font-mono text-xl font-semibold tabular-nums text-[#1C1B19]">
                      {stat.val}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Recent Orders Table */}
                <div className="lg:col-span-7 rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-lg font-semibold text-[#1C1B19]">
                      Recent Orders (Database Live View)
                    </h2>
                    <Link href="/admin/orders" className="text-xs text-[#2E473B] underline">
                      Manage All Orders
                    </Link>
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#E5DEC9] text-[#6E6A63]">
                      <tr>
                        <th className="py-2">Order #</th>
                        <th className="py-2">Customer</th>
                        <th className="py-2">Order Status</th>
                        <th className="py-2">Payment</th>
                        <th className="py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEAE1]">
                      {data.orders.slice(0, 6).map((ord) => (
                        <tr key={ord.id}>
                          <td className="py-2.5 font-mono font-medium">{ord.orderNumber}</td>
                          <td className="py-2.5">{ord.customerName}</td>
                          <td className="py-2.5">{ord.orderStatus}</td>
                          <td className="py-2.5">{ord.paymentStatus}</td>
                          <td className="py-2.5 font-mono tabular-nums text-right">
                            ₹{ord.totalInr.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Operational Alerts: Low Stock & Unverified Suppliers */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-5 space-y-3">
                    <h2 className="font-serif text-lg font-semibold text-[#1C1B19]">
                      Low-Stock &amp; Compliance Alerts
                    </h2>
                    <ul className="space-y-2 text-xs">
                      {data.products
                        .filter((p) => p.stockQuantity <= p.lowStockThreshold)
                        .map((p) => (
                          <li
                            key={p.id}
                            className="flex items-center justify-between rounded border border-[#E5DEC9] bg-[#F5F1E8] px-3 py-2"
                          >
                            <span>
                              <strong>{p.sku}</strong> · {p.name}
                            </span>
                            <span className="font-mono text-[#8C3B2B] shrink-0 ml-2">
                              {p.stockQuantity} left
                            </span>
                          </li>
                        ))}
                      {data.products
                        .filter((p) => p.reviewStatus !== 'REVIEWED_VERIFIED')
                        .map((p) => (
                          <li
                            key={p.id}
                            className="flex items-center justify-between rounded border border-[#E5DEC9] bg-[#F5F1E8] px-3 py-2"
                          >
                            <span>
                              <strong>{p.sku}</strong> · Awaiting Cultural Review
                            </span>
                            <Link
                              href="/admin/products"
                              className="text-[#2E473B] underline shrink-0 ml-2"
                            >
                              Review
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-5 space-y-2 text-xs">
                    <h2 className="font-serif text-lg font-semibold text-[#1C1B19]">
                      Supplier Verification Queue
                    </h2>
                    {data.suppliers
                      .filter((s) => s.verificationStatus !== 'VERIFIED_CONTRACT')
                      .map((s) => (
                        <div key={s.id} className="flex items-center justify-between py-1">
                          <span>
                            {s.name} ({s.code})
                          </span>
                          <Link href="/admin/suppliers" className="text-[#2E473B] underline">
                            {s.verificationStatus}
                          </Link>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: PRODUCTS */}
          {activeSection === 'products' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-5 space-y-4">
                <h2 className="font-serif text-lg font-semibold text-[#1C1B19] flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#2E473B]" />
                  <span>Create New Catalogue Product</span>
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newProdName.trim()) return;
                    runAdminMutation(
                      {
                        action: 'CREATE_PRODUCT',
                        name: newProdName,
                        sku: newProdSku || `LC-PRD-${Date.now().toString().slice(-4)}`,
                        sellingPriceInr: Number(newProdPrice),
                        stockQuantity: Number(newProdStock),
                        shortDescription: newProdDesc || 'Verified end-of-life essential.',
                      },
                      `Created product "${newProdName}"`
                    );
                    setNewProdName('');
                    setNewProdSku('');
                    setNewProdDesc('');
                  }}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-12 text-xs"
                >
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Product Title *"
                    className="sm:col-span-4 rounded border border-[#CFC7B8] bg-white px-3 py-2"
                  />
                  <input
                    type="text"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    placeholder="SKU (e.g. LC-TXT-020)"
                    className="sm:col-span-2 rounded border border-[#CFC7B8] bg-white px-3 py-2 font-mono"
                  />
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="Selling Price INR *"
                    className="sm:col-span-2 rounded border border-[#CFC7B8] bg-white px-3 py-2 font-mono"
                  />
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    placeholder="Stock Qty *"
                    className="sm:col-span-2 rounded border border-[#CFC7B8] bg-white px-3 py-2 font-mono"
                  />
                  <button
                    type="submit"
                    className="sm:col-span-2 rounded bg-[#2E473B] px-4 py-2 font-medium text-[#FAF8F5] hover:bg-[#23372D]"
                  >
                    Create Product
                  </button>
                </form>
              </div>

              <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#E5DEC9] bg-[#F4F0E6] text-[#1C1B19]">
                    <tr>
                      <th className="px-4 py-3">SKU &amp; Product</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-right">Cost (Admin)</th>
                      <th className="px-4 py-3 text-right">Selling Price</th>
                      <th className="px-4 py-3 text-right">Stock</th>
                      <th className="px-4 py-3">Cultural Review</th>
                      <th className="px-4 py-3">Publication</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DEC9]">
                    {data.products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-[#F5F1E8]">
                        <td className="px-4 py-3">
                          <p className="font-mono font-semibold text-[#1C1B19]">{prod.sku}</p>
                          <p className="text-[#4E4B45]">{prod.name}</p>
                        </td>
                        <td className="px-4 py-3 text-[#5C5852]">{prod.categoryName}</td>
                        <td className="px-4 py-3 font-mono tabular-nums text-right text-[#6E6A63]">
                          ₹{prod.costPriceInr}
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-right font-semibold">
                          ₹{prod.sellingPriceInr}
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-right">
                          {prod.stockQuantity} (Res: {prod.reservedQuantity})
                        </td>
                        <td className="px-4 py-3">
                          {prod.reviewStatus === 'REVIEWED_VERIFIED' ? (
                            <span className="text-[#2E473B] font-medium">Verified</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                runAdminMutation(
                                  {
                                    action: 'UPDATE_INVENTORY_AND_PRICE',
                                    productId: prod.id,
                                    reviewStatus: 'REVIEWED_VERIFIED',
                                  },
                                  `Approved cultural review for ${prod.sku}`
                                )
                              }
                              className="rounded border border-[#7A5C3E] px-2 py-1 text-[11px] text-[#7A5C3E] hover:bg-[#EFEBE2]"
                            >
                              Approve Review
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono">{prod.publicationStatus}</td>
                        <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              runAdminMutation(
                                {
                                  action: 'UPDATE_INVENTORY_AND_PRICE',
                                  productId: prod.id,
                                  publicationStatus:
                                    prod.publicationStatus === 'PUBLISHED'
                                      ? 'UNPUBLISHED'
                                      : 'PUBLISHED',
                                },
                                `Toggled publication status for ${prod.sku}`
                              )
                            }
                            className="rounded border border-[#CFC7B8] bg-white px-2.5 py-1 text-[11px] font-medium hover:border-[#2E473B]"
                          >
                            {prod.publicationStatus === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 3: CATEGORIES */}
          {activeSection === 'categories' && (
            <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E5DEC9] bg-[#F4F0E6]">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Category Name</th>
                    <th className="px-4 py-3">URL Slug</th>
                    <th className="px-4 py-3">Storefront Group</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DEC9]">
                  {data.categories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="px-4 py-3 font-mono">{cat.sortOrder}</td>
                      <td className="px-4 py-3 font-semibold">{cat.name}</td>
                      <td className="px-4 py-3 font-mono text-[#5C5852]">/categories/{cat.slug}</td>
                      <td className="px-4 py-3">{cat.groupSlug}</td>
                      <td className="px-4 py-3 text-[#2E473B] font-medium">
                        {cat.publicationStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SECTION 4: ORDERS & REFUNDS */}
          {activeSection === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <input
                  type="search"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by Order # (e.g. LC-2026-1001), customer name, email, or PIN..."
                  className="w-full max-w-md rounded border border-[#CFC7B8] bg-white px-3.5 py-2 text-xs"
                />
              </div>

              <div className="space-y-4">
                {data.orders
                  .filter((o) => {
                    if (!orderSearch.trim()) return true;
                    const q = orderSearch.toLowerCase();
                    return (
                      o.orderNumber.toLowerCase().includes(q) ||
                      o.customerName.toLowerCase().includes(q) ||
                      o.customerEmail.toLowerCase().includes(q) ||
                      o.shippingAddress.pinCode.includes(q)
                    );
                  })
                  .map((order) => (
                    <div
                      key={order.id}
                      className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-5 space-y-4 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DEC9] pb-3">
                        <div>
                          <span className="font-mono text-sm font-semibold text-[#1C1B19]">
                            {order.orderNumber}
                          </span>{' '}
                          · <span>{order.customerName}</span> ({order.customerEmail}) · PIN:{' '}
                          <span className="font-mono">{order.shippingAddress.pinCode}</span>
                        </div>
                        <div className="font-mono font-semibold text-sm">
                          ₹{order.totalInr.toLocaleString('en-IN')} ({order.paymentStatus})
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1 text-[#4E4B45]">
                          <p>
                            Order State: <strong>{order.orderStatus}</strong> · Fulfilment:{' '}
                            <strong>{order.fulfilmentStatus}</strong>
                          </p>
                          {order.refundDetails && (
                            <p className="text-[#8C3B2B]">
                              Refund Request ({order.refundDetails.status}): ₹
                              {order.refundDetails.amountInr} — {order.refundDetails.reason}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {(
                            [
                              'PROCESSING',
                              'READY_FOR_DISPATCH',
                              'SHIPPED',
                              'DELIVERED',
                              'REFUND_PENDING',
                              'REFUNDED',
                            ] as OrderStatus[]
                          ).map((nextState) => (
                            <button
                              key={nextState}
                              type="button"
                              onClick={() =>
                                runAdminMutation(
                                  {
                                    action: 'UPDATE_ORDER_STATUS',
                                    orderNumber: order.orderNumber,
                                    nextStatus: nextState,
                                    note: `Transitioned to ${nextState} via Admin Console.`,
                                  },
                                  `Updated ${order.orderNumber} to ${nextState}`
                                )
                              }
                              className="rounded border border-[#CFC7B8] bg-white px-2.5 py-1 text-[11px] hover:border-[#2E473B]"
                            >
                              → {nextState.replace(/_/g, ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* SECTION 5: INVENTORY */}
          {activeSection === 'inventory' && (
            <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E5DEC9] bg-[#F4F0E6]">
                  <tr>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3 text-right">Physical Stock</th>
                    <th className="px-4 py-3 text-right">Reserved</th>
                    <th className="px-4 py-3 text-right">Available</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Quick Atomic Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DEC9]">
                  {data.products.map((prod) => {
                    const avail = Math.max(0, prod.stockQuantity - prod.reservedQuantity);
                    return (
                      <tr key={prod.id}>
                        <td className="px-4 py-3 font-mono font-semibold">{prod.sku}</td>
                        <td className="px-4 py-3">{prod.name}</td>
                        <td className="px-4 py-3 font-mono tabular-nums text-right">
                          {prod.stockQuantity}
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-right">
                          {prod.reservedQuantity}
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-right font-semibold">
                          {avail}
                        </td>
                        <td className="px-4 py-3">
                          {prod.stockQuantity <= prod.lowStockThreshold ? (
                            <span className="text-[#8C3B2B] font-medium">LOW STOCK</span>
                          ) : (
                            <span className="text-[#2E473B]">NOMINAL</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              runAdminMutation(
                                {
                                  action: 'UPDATE_INVENTORY_AND_PRICE',
                                  productId: prod.id,
                                  stockQuantity: prod.stockQuantity + 10,
                                },
                                `Added +10 units to ${prod.sku}`
                              )
                            }
                            className="rounded bg-[#2E473B] px-2.5 py-1 text-[11px] text-[#FAF8F5]"
                          >
                            +10 Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* SECTION 6: SUPPLIERS */}
          {activeSection === 'suppliers' && (
            <div className="space-y-4">
              {data.suppliers.map((sup) => (
                <div
                  key={sup.id}
                  className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-5 flex flex-wrap items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-[#1C1B19]">
                      {sup.name} ({sup.code})
                    </p>
                    <p className="text-[#5C5852]">
                      Legal Entity: {sup.legalBusinessName} · GSTIN:{' '}
                      <span className="font-mono">{sup.gstin}</span>
                    </p>
                    <p className="text-[#5C5852]">
                      Regions: {sup.fulfilmentRegions.join(', ')} · SLA: {sup.dispatchSlaHours}h
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold">{sup.verificationStatus}</span>
                    {sup.verificationStatus !== 'VERIFIED_CONTRACT' && (
                      <button
                        type="button"
                        onClick={() =>
                          runAdminMutation(
                            {
                              action: 'VERIFY_SUPPLIER',
                              supplierId: sup.id,
                              verificationStatus: 'VERIFIED_CONTRACT',
                            },
                            `Completed contract verification for ${sup.name}`
                          )
                        }
                        className="rounded bg-[#2E473B] px-3 py-1.5 text-[#FAF8F5] font-medium"
                      >
                        Complete Verification
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECTION 7: DELIVERY ZONES */}
          {activeSection === 'delivery-zones' && (
            <div className="space-y-4">
              {data.deliveryZones.map((zone) => (
                <div
                  key={zone.id}
                  className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-5 flex flex-wrap items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-[#1C1B19]">{zone.zoneName}</p>
                    <p className="text-[#5C5852]">
                      PIN Prefixes:{' '}
                      <span className="font-mono">{zone.pinCodePrefixes.join(', ')}</span> · Cut-off:{' '}
                      {zone.dispatchCutoffLocalTime}
                    </p>
                    <p className="text-[#5C5852]">
                      Window: {zone.estimatedWindow} · Standard Fee: ₹{zone.standardFeeInr}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      runAdminMutation(
                        {
                          action: 'TOGGLE_DELIVERY_ZONE',
                          zoneId: zone.id,
                          isActive: !zone.isActive,
                        },
                        `Toggled zone ${zone.zoneName}`
                      )
                    }
                    className={`rounded px-3 py-1.5 font-medium ${
                      zone.isActive
                        ? 'bg-[#2E473B] text-[#FAF8F5]'
                        : 'border border-[#8C3B2B] text-[#8C3B2B]'
                    }`}
                  >
                    {zone.isActive ? 'Active (Click to Pause)' : 'Paused (Click to Enable)'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SECTION 8: CUSTOMERS */}
          {activeSection === 'customers' && (
            <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E5DEC9] bg-[#F4F0E6]">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Newsletter Opt-In</th>
                    <th className="px-4 py-3">Deletion Request</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DEC9]">
                  {data.users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 font-medium">{u.fullName}</td>
                      <td className="px-4 py-3 font-mono">{u.email}</td>
                      <td className="px-4 py-3 font-mono">{u.role}</td>
                      <td className="px-4 py-3">
                        {u.consentPreferences.guidanceNewsletterOptIn ? 'Opted In' : 'No (Default)'}
                      </td>
                      <td className="px-4 py-3">
                        {u.deletionRequestedAt ? (
                          <span className="text-[#8C3B2B] font-medium">
                            Requested ({u.deletionRequestedAt.slice(0, 10)})
                          </span>
                        ) : (
                          'None'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SECTION 9: SERVICE PROVIDERS & ENQUIRIES */}
          {activeSection === 'service-providers' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-5 space-y-3">
                <h2 className="font-serif text-lg font-semibold text-[#1C1B19]">
                  Incoming Service Referral Enquiries ({data.serviceEnquiries.length})
                </h2>
                {data.serviceEnquiries.length === 0 ? (
                  <p className="text-xs text-[#5C5852]">
                    No customer service enquiries submitted yet in this session.
                  </p>
                ) : (
                  <div className="divide-y divide-[#E5DEC9] text-xs">
                    {data.serviceEnquiries.map((enq) => (
                      <div key={enq.id} className="py-3 flex justify-between">
                        <div>
                          <p className="font-semibold">
                            {enq.enquiryNumber} · {enq.customerName} ({enq.customerPhone})
                          </p>
                          <p className="text-[#5C5852]">
                            Provider: {enq.providerName} · Message: {enq.message}
                          </p>
                        </div>
                        <span className="font-mono">{enq.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-5 space-y-3">
                <h2 className="font-serif text-lg font-semibold text-[#1C1B19]">
                  Directory Providers ({data.serviceListings.length})
                </h2>
                {data.serviceListings.map((srv) => (
                  <div
                    key={srv.id}
                    className="border-b border-[#EFEAE1] pb-3 flex justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold">{srv.providerName}</p>
                      <p className="text-[#5C5852]">
                        {srv.category} · {srv.city}
                      </p>
                    </div>
                    <span className="font-mono">{srv.verificationStatus}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 10: CONTENT & KITS */}
          {activeSection === 'content' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-5 space-y-3">
                <h2 className="font-serif text-lg font-semibold text-[#1C1B19]">
                  Curated Ritual Kits ({data.ritualKits.length})
                </h2>
                {data.ritualKits.map((kit) => (
                  <div
                    key={kit.id}
                    className="border-b border-[#EFEAE1] pb-3 flex justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold">
                        {kit.sku} · {kit.name} (v{kit.versionNumber})
                      </p>
                      <p className="text-[#5C5852]">
                        Reviewed by: {kit.reviewedBy} on {kit.lastReviewedAt}
                      </p>
                    </div>
                    <span className="font-mono">₹{kit.basePriceInr}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-5 space-y-3">
                <h2 className="font-serif text-lg font-semibold text-[#1C1B19]">
                  Guidance Centre Articles ({data.guidanceArticles.length})
                </h2>
                {data.guidanceArticles.map((art) => (
                  <div
                    key={art.id}
                    className="border-b border-[#EFEAE1] pb-3 flex justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold">{art.title}</p>
                      <p className="text-[#5C5852]">Reviewer: {art.reviewerName}</p>
                    </div>
                    <span className="font-mono">{art.publicationStatus}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 11: COUPONS */}
          {activeSection === 'coupons' && (
            <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E5DEC9] bg-[#F4F0E6]">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Value</th>
                    <th className="px-4 py-3 text-right">Min Order</th>
                    <th className="px-4 py-3 text-right">Used Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DEC9]">
                  {data.coupons.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                      <td className="px-4 py-3">{c.description}</td>
                      <td className="px-4 py-3 font-mono">{c.discountType}</td>
                      <td className="px-4 py-3 font-mono text-right">{c.discountValue}</td>
                      <td className="px-4 py-3 font-mono text-right">₹{c.minOrderInr}</td>
                      <td className="px-4 py-3 font-mono text-right">{c.usedCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SECTION 12: REVIEWS */}
          {activeSection === 'reviews' && (
            <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 space-y-2 text-xs">
              <h2 className="font-serif text-lg font-semibold text-[#1C1B19]">
                Verified-Purchase Review Moderation Queue
              </h2>
              <p className="text-[#5C5852]">
                In accordance with LastCry integrity policies, zero fabricated reviews or star ratings are seeded or displayed on public product pages. Verified-purchase customer reviews submitted in Phase 2 appear here for moderation.
              </p>
            </div>
          )}

          {/* SECTION 13: SUPPORT & GRIEVANCES */}
          {activeSection === 'support' && (
            <div className="space-y-4">
              {data.supportTickets.map((tkt) => (
                <div
                  key={tkt.id}
                  className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-5 flex flex-wrap items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">
                      {tkt.ticketNumber} · {tkt.subject} ({tkt.category})
                    </p>
                    <p className="text-[#5C5852]">
                      From: {tkt.name} ({tkt.email}) · Order: {tkt.orderNumber || 'N/A'}
                    </p>
                    <p className="text-[#1C1B19]">{tkt.message}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold">{tkt.status}</span>
                    {tkt.status !== 'RESOLVED' && (
                      <button
                        type="button"
                        onClick={() =>
                          runAdminMutation(
                            {
                              action: 'RESOLVE_TICKET',
                              ticketId: tkt.id,
                              status: 'RESOLVED',
                              resolutionNote: 'Addressed by customer care desk.',
                            },
                            `Resolved ticket ${tkt.ticketNumber}`
                          )
                        }
                        className="rounded bg-[#2E473B] px-3 py-1.5 text-[#FAF8F5]"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECTION 14: SETTINGS & ENVIRONMENT */}
          {activeSection === 'settings' && (
            <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 space-y-4 text-xs">
              <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
                External Integration &amp; Sandbox Status
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded border border-[#E5DEC9] bg-[#F5F1E8] p-4 space-y-1">
                  <p className="font-semibold text-[#1C1B19] flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#2E473B]" />
                    <span>Database Persistence Engine</span>
                  </p>
                  <p className="text-[#5C5852]">
                    Active: Transactional File Store (<code>.data/lastcry-db.json</code>) + Prisma PostgreSQL Schema &amp; Migrations (<code>prisma/schema.prisma</code>).
                  </p>
                </div>

                <div className="rounded border border-[#E5DEC9] bg-[#F5F1E8] p-4 space-y-1">
                  <p className="font-semibold text-[#1C1B19] flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-[#7A5C3E]" />
                    <span>Payment Gateway (Razorpay Adapter)</span>
                  </p>
                  <p className="text-[#5C5852]">
                    Active Mode: <strong>Sandbox HMAC-SHA256 Verifier</strong>. Set{' '}
                    <code>RAZORPAY_KEY_ID</code>, <code>RAZORPAY_KEY_SECRET</code>, and{' '}
                    <code>PAYMENT_SANDBOX_MODE=false</code> in <code>.env</code> for live capture.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 15: AUDIT LOGS */}
          {activeSection === 'audit-logs' && (
            <div className="rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E5DEC9] bg-[#F4F0E6]">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DEC9]">
                  {data.auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#5C5852]">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-mono">{log.actorEmail}</td>
                      <td className="px-4 py-3 font-mono">{log.actorRole}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-[#2E473B]">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {log.entityType} ({log.entityId})
                      </td>
                      <td className="px-4 py-3 text-[#3A3732]">{log.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
