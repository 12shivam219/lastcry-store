'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  MapPin,
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/components/providers/StoreContext';

interface QuickSearchResult {
  products: {
    id: string;
    name: string;
    slug: string;
    categoryName: string;
    sellingPriceInr: number;
  }[];
  ritualKits: {
    id: string;
    name: string;
    slug: string;
    intendedTradition: string;
    basePriceInr: number;
  }[];
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartItems, pinCode, pinCheck, setPinCode, wishlistIds } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState(pinCode);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<QuickSearchResult>({
    products: [],
    ritualKits: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) return;
    let cancelled = false;
    fetch(`/api/catalog?q=${encodeURIComponent(q)}&pageSize=5`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setSearchResults({
            products: data.products || [],
            ritualKits: data.ritualKits || [],
          });
          setIsSearching(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  // Do not show storefront header on /admin routes (Admin has its own dedicated workspace layout)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinCode(pinInput);
    setPinModalOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      {/* Main 3-Zone Top Bar */}
      <header className="sticky top-0 z-40 border-b border-[#E5DEC9] bg-[#FAF8F5]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <Link
            href="/"
            className="font-serif text-2xl font-semibold tracking-tight text-[#1C1B19] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2E473B]"
          >
            LastCry
          </Link>

          {/* Zone 2: Concise Single-Line Navigation Links */}
          <nav
            aria-label="Primary Storefront Navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#4E4B45]"
          >
            <Link
              href="/shop/essentials"
              className={`hover:text-[#1C1B19] transition-colors whitespace-nowrap shrink-0 py-1 ${
                pathname?.startsWith('/shop/essentials')
                  ? 'text-[#1C1B19] underline underline-offset-8 decoration-[#2E473B] decoration-2'
                  : ''
              }`}
            >
              Shop Essentials
            </Link>
            <Link
              href="/shop/ritual-kits"
              className={`hover:text-[#1C1B19] transition-colors whitespace-nowrap shrink-0 py-1 ${
                pathname?.startsWith('/shop/ritual-kits') ||
                pathname?.startsWith('/ritual-kits')
                  ? 'text-[#1C1B19] underline underline-offset-8 decoration-[#2E473B] decoration-2'
                  : ''
              }`}
            >
              Ritual Kits
            </Link>
            <Link
              href="/shop/memorials"
              className={`hover:text-[#1C1B19] transition-colors whitespace-nowrap shrink-0 py-1 ${
                pathname?.startsWith('/shop/memorials')
                  ? 'text-[#1C1B19] underline underline-offset-8 decoration-[#2E473B] decoration-2'
                  : ''
              }`}
            >
              Memorials
            </Link>
            <Link
              href="/shop/condolence-gifts"
              className={`hover:text-[#1C1B19] transition-colors whitespace-nowrap shrink-0 py-1 ${
                pathname?.startsWith('/shop/condolence-gifts')
                  ? 'text-[#1C1B19] underline underline-offset-8 decoration-[#2E473B] decoration-2'
                  : ''
              }`}
            >
              Condolence Gifts
            </Link>
            <Link
              href="/guidance"
              className={`hover:text-[#1C1B19] transition-colors whitespace-nowrap shrink-0 py-1 ${
                pathname?.startsWith('/guidance')
                  ? 'text-[#1C1B19] underline underline-offset-8 decoration-[#2E473B] decoration-2'
                  : ''
              }`}
            >
              Guidance
            </Link>
            <Link
              href="/services"
              className={`hover:text-[#1C1B19] transition-colors whitespace-nowrap shrink-0 py-1 ${
                pathname?.startsWith('/services')
                  ? 'text-[#1C1B19] underline underline-offset-8 decoration-[#2E473B] decoration-2'
                  : ''
              }`}
            >
              Local Services
            </Link>
          </nav>

          {/* Zone 3: Primary Action & Compact Utility Affordances */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setPinInput(pinCode);
                setPinModalOpen(true);
              }}
              aria-label="Select delivery PIN code"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-[#DFD8CC] bg-[#F3EFE6] px-2.5 py-1.5 text-xs font-medium text-[#3A3732] hover:border-[#B6935A] transition-colors whitespace-nowrap shrink-0"
            >
              <MapPin className="h-3.5 w-3.5 text-[#2E473B]" />
              <span className="font-mono tabular-nums">{pinCode || 'PIN Code'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products and kits"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#3A3732] hover:bg-[#EFEBE2] transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>

            <Link
              href="/wishlist"
              aria-label={`Saved items (${wishlistIds.length})`}
              className="hidden sm:inline-flex relative h-10 w-10 items-center justify-center rounded-md text-[#3A3732] hover:bg-[#EFEBE2] transition-colors"
            >
              <Heart className="h-4 w-4" />
              {wishlistIds.length > 0 && (
                <span className="sr-only">{wishlistIds.length} saved items</span>
              )}
            </Link>

            <Link
              href="/account"
              aria-label="Customer account"
              className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-md text-[#3A3732] hover:bg-[#EFEBE2] transition-colors"
            >
              <User className="h-4 w-4" />
            </Link>

            <Link
              href="/cart"
              className="inline-flex items-center gap-2 rounded-md bg-[#2E473B] px-3.5 py-2 text-xs font-medium text-[#FAF8F5] hover:bg-[#23372D] transition-colors whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Cart</span>
              <span className="font-mono tabular-nums">({totalCartCount})</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-md text-[#1C1B19] hover:bg-[#EFEBE2]"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Accessible Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E5DEC9] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setPinInput(pinCode);
                  setPinModalOpen(true);
                }}
                className="inline-flex items-center gap-2 text-xs font-medium text-[#2E473B]"
              >
                <MapPin className="h-4 w-4" />
                <span>Delivery PIN: {pinCode}</span>
                <span className="underline">Change</span>
              </button>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-[#5C5852] underline"
              >
                Need Help?
              </Link>
            </div>

            <nav className="grid gap-2 text-sm font-medium text-[#1C1B19]">
              <Link
                href="/shop/essentials"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2.5 hover:bg-[#EFEBE2]"
              >
                Shop Essentials
              </Link>
              <Link
                href="/shop/ritual-kits"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2.5 hover:bg-[#EFEBE2]"
              >
                Curated Ritual Kits
              </Link>
              <Link
                href="/shop/memorials"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2.5 hover:bg-[#EFEBE2]"
              >
                Memorial Frames &amp; Keepsakes
              </Link>
              <Link
                href="/shop/condolence-gifts"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2.5 hover:bg-[#EFEBE2]"
              >
                Condolence Gifts &amp; Flowers
              </Link>
              <Link
                href="/guidance"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2.5 hover:bg-[#EFEBE2]"
              >
                Guidance Centre
              </Link>
              <Link
                href="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2.5 hover:bg-[#EFEBE2]"
              >
                Find Local Services
              </Link>
              <div className="mt-2 grid grid-cols-3 gap-2 border-t border-[#E5DEC9] pt-3 text-xs">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md border border-[#DFD8CC] px-3 py-2 text-center"
                >
                  Account
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md border border-[#DFD8CC] px-3 py-2 text-center"
                >
                  Saved ({wishlistIds.length})
                </Link>
                <Link
                  href="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md border border-[#DFD8CC] px-3 py-2 text-center"
                >
                  Track Order
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* PIN-Code Coverage Modal */}
      {pinModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pin-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-md rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="pin-modal-title"
                  className="font-serif text-xl font-semibold text-[#1C1B19]"
                >
                  Check Delivery Coverage &amp; Estimates
                </h2>
                <p className="mt-1 text-xs text-[#5C5852]">
                  Enter your 6-digit Indian PIN code to see verified hub availability and realistic dispatch windows.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPinModalOpen(false)}
                aria-label="Close PIN code dialog"
                className="rounded-md p-1 text-[#5C5852] hover:bg-[#EFEBE2]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePinSubmit} className="mt-4 flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 400001, 110001, 560001"
                className="flex-1 rounded-md border border-[#CFC7B8] bg-white px-3.5 py-2 font-mono text-sm text-[#1C1B19] focus:border-[#2E473B] focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-[#2E473B] px-4 py-2 text-xs font-medium text-[#FAF8F5] hover:bg-[#23372D] transition-colors whitespace-nowrap shrink-0"
              >
                Apply PIN
              </button>
            </form>

            {pinCheck && (
              <div className="mt-4 rounded-md border border-[#E2DACB] bg-[#F3EFE6] p-3.5 text-xs">
                {pinCheck.isServiceable ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 font-medium text-[#2E473B]">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        Serviceable via {pinCheck.zone?.zoneName} ({pinCheck.pinCode})
                      </span>
                    </div>
                    <p className="text-[#3A3732]">
                      Standard Estimate: <strong>{pinCheck.estimatedWindow}</strong> (Cut-off:{' '}
                      {pinCheck.dispatchCutoff})
                    </p>
                    {pinCheck.priorityAvailable && (
                      <p className="text-[#5C5852]">
                        Priority Local Courier: {pinCheck.priorityWindow}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-[#8C3B2B]">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{pinCheck.estimatedWindow}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 border-t border-[#E5DEC9] pt-3">
              <p className="text-[11px] text-[#6E6A63]">
                Quick sample hubs:{' '}
                {[
                  { label: 'Mumbai (400001)', pin: '400001' },
                  { label: 'Pune (411004)', pin: '411004' },
                  { label: 'Delhi (110001)', pin: '110001' },
                  { label: 'Bengaluru (560001)', pin: '560001' },
                  { label: 'Chennai (600004)', pin: '600004' },
                ].map((hub, i) => (
                  <React.Fragment key={hub.pin}>
                    {i > 0 && ' · '}
                    <button
                      type="button"
                      onClick={() => {
                        setPinInput(hub.pin);
                        setPinCode(hub.pin);
                      }}
                      className="underline hover:text-[#1C1B19]"
                    >
                      {hub.label}
                    </button>
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instant Search Modal */}
      {searchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search catalogue"
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 p-4 pt-16 sm:pt-24"
        >
          <div className="w-full max-w-2xl rounded-lg border border-[#DFD8CC] bg-[#FAF8F5] p-5 shadow-2xl">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 border-b border-[#E5DEC9] pb-3">
              <Search className="h-5 w-5 text-[#5C5852]" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  if (val.trim().length < 2) {
                    setSearchResults({ products: [], ritualKits: [] });
                    setIsSearching(false);
                  } else {
                    setIsSearching(true);
                  }
                }}
                placeholder="Search shrouds, Antyeshti or Kafan kits, teakwood frames, condolence parcels..."
                className="flex-1 bg-transparent text-sm text-[#1C1B19] placeholder:text-[#7A756D] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-md px-2 py-1 text-xs text-[#5C5852] hover:bg-[#EFEBE2]"
              >
                Esc / Close
              </button>
            </form>

            <div aria-live="polite" className="mt-4 max-h-[60vh] overflow-y-auto space-y-4">
              {searchQuery.trim().length < 2 ? (
                <div className="space-y-3">
                  <p className="text-xs text-[#6E6A63]">Browse by category or tradition:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Last-Rites Essentials', href: '/shop/essentials' },
                      { label: 'Curated Ritual Kits', href: '/shop/ritual-kits' },
                      { label: 'Memorial Frames & Books', href: '/shop/memorials' },
                      { label: 'Condolence Care Parcels', href: '/shop/condolence-gifts' },
                      { label: 'Understanding Kit Contents', href: '/guidance/understanding-the-contents-of-a-ritual-kit' },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSearchOpen(false)}
                        className="rounded-md border border-[#DFD8CC] bg-[#F3EFE6] px-3 py-1.5 text-xs text-[#1C1B19] hover:border-[#2E473B]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : isSearching ? (
                <p className="py-6 text-center text-xs text-[#5C5852]">Searching verified catalogue...</p>
              ) : searchResults.products.length === 0 && searchResults.ritualKits.length === 0 ? (
                <div className="py-6 text-center space-y-2">
                  <p className="text-sm font-medium text-[#1C1B19]">
                    No matching products or kits found for &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <p className="text-xs text-[#5C5852]">
                    Try searching for &ldquo;cotton&rdquo;, &ldquo;kafan&rdquo;, &ldquo;kalash&rdquo;, &ldquo;frame&rdquo;, or browse all essentials.
                  </p>
                </div>
              ) : (
                <>
                  {searchResults.ritualKits.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[#5C5852] mb-2">Curated Ritual Kits</p>
                      <div className="divide-y divide-[#E5DEC9] rounded-md border border-[#E5DEC9] bg-white">
                        {searchResults.ritualKits.map((kit) => (
                          <Link
                            key={kit.id}
                            href={`/ritual-kits/${kit.slug}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center justify-between px-4 py-3 hover:bg-[#FAF8F5]"
                          >
                            <div>
                              <p className="text-sm font-medium text-[#1C1B19]">{kit.name}</p>
                              <p className="text-xs text-[#5C5852]">{kit.intendedTradition}</p>
                            </div>
                            <span className="font-mono text-sm tabular-nums text-[#1C1B19]">
                              ₹{kit.basePriceInr.toLocaleString('en-IN')}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.products.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[#5C5852] mb-2">Individual Products</p>
                      <div className="divide-y divide-[#E5DEC9] rounded-md border border-[#E5DEC9] bg-white">
                        {searchResults.products.map((prod) => (
                          <Link
                            key={prod.id}
                            href={`/product/${prod.slug}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center justify-between px-4 py-3 hover:bg-[#FAF8F5]"
                          >
                            <div>
                              <p className="text-sm font-medium text-[#1C1B19]">{prod.name}</p>
                              <p className="text-xs text-[#5C5852]">{prod.categoryName}</p>
                            </div>
                            <span className="font-mono text-sm tabular-nums text-[#1C1B19]">
                              ₹{prod.sellingPriceInr.toLocaleString('en-IN')}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 text-right">
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2E473B] hover:underline"
                    >
                      <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
