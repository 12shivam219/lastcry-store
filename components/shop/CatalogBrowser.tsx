'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import {
  ProductRecord,
  RitualKitRecord,
  CategoryRecord,
  TraditionCollection,
} from '@/lib/db/types';
import ProductCard from '@/components/ui/ProductCard';
import RitualKitCard from '@/components/ui/RitualKitCard';

interface CatalogBrowserProps {
  title: string;
  subtitle: string;
  initialProducts: Omit<ProductRecord, 'costPriceInr'>[];
  initialKits?: RitualKitRecord[];
  categories: CategoryRecord[];
  traditions: TraditionCollection[];
  defaultCategorySlug?: string;
  defaultGroupSlug?: string;
  defaultTraditionSlug?: string;
  defaultSearchQuery?: string;
  showKitsFirst?: boolean;
}

export default function CatalogBrowser({
  title,
  subtitle,
  initialProducts,
  initialKits = [],
  categories,
  traditions,
  defaultCategorySlug = '',
  defaultGroupSlug = '',
  defaultTraditionSlug = '',
  defaultSearchQuery = '',
  showKitsFirst = false,
}: CatalogBrowserProps) {
  const [searchQuery, setSearchQuery] = useState(defaultSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategorySlug);
  const [selectedTradition, setSelectedTradition] = useState(defaultTraditionSlug);
  const [selectedDesignation, setSelectedDesignation] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(3500);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'newest'>(
    'relevance'
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeTraditionNote = useMemo(
    () => traditions.find((t) => t.slug === selectedTradition),
    [traditions, selectedTradition]
  );

  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    if (defaultGroupSlug) {
      list = list.filter((p) => p.groupSlug === defaultGroupSlug);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.materials.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      list = list.filter((p) => p.categorySlug === selectedCategory);
    }

    if (selectedTradition) {
      list = list.filter((p) => p.traditionSlugs.includes(selectedTradition));
    }

    if (selectedDesignation) {
      list = list.filter((p) => p.designation === selectedDesignation);
    }

    list = list.filter((p) => p.sellingPriceInr <= maxPrice);

    if (inStockOnly) {
      list = list.filter((p) => p.stockQuantity - p.reservedQuantity > 0);
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.sellingPriceInr - b.sellingPriceInr);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.sellingPriceInr - a.sellingPriceInr);
    } else if (sortBy === 'newest') {
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return list;
  }, [
    initialProducts,
    defaultGroupSlug,
    searchQuery,
    selectedCategory,
    selectedTradition,
    selectedDesignation,
    maxPrice,
    inStockOnly,
    sortBy,
  ]);

  const filteredKits = useMemo(() => {
    let list = [...initialKits];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (k) =>
          k.name.toLowerCase().includes(q) ||
          k.shortDescription.toLowerCase().includes(q) ||
          k.intendedTradition.toLowerCase().includes(q)
      );
    }
    if (selectedTradition) {
      list = list.filter((k) => k.traditionSlug === selectedTradition);
    }
    list = list.filter((k) => k.basePriceInr <= Math.max(maxPrice, 4500));
    return list;
  }, [initialKits, searchQuery, selectedTradition, maxPrice]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(defaultCategorySlug);
    setSelectedTradition('');
    setSelectedDesignation('');
    setMaxPrice(3500);
    setInStockOnly(false);
    setSortBy('relevance');
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header & Breadcrumb */}
      <div className="border-b border-[#E5DEC9] pb-6 space-y-2">
        <nav aria-label="Breadcrumb" className="text-xs text-[#6E6A63] flex items-center gap-1.5">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/shop" className="hover:underline">
            Catalogue
          </Link>
          {title !== 'Complete Verified Catalogue' && (
            <>
              <span aria-hidden="true">/</span>
              <span className="text-[#1C1B19]">{title}</span>
            </>
          )}
        </nav>

        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1B19]">
          {title}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-[#5C5852]">
          {subtitle}
        </p>
      </div>

      {/* Top Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-lg border border-[#E5DEC9] bg-[#F5F1E8] p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E6A63]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by product name, SKU, material (e.g. cotton, teak, kalash)..."
            aria-label="Filter catalogue by keyword"
            className="w-full rounded-md border border-[#CFC7B8] bg-[#FAF8F5] pl-9 pr-3 py-2 text-xs text-[#1C1B19] placeholder:text-[#7A756D] focus:border-[#2E473B] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="inline-flex lg:hidden items-center gap-1.5 rounded-md border border-[#CFC7B8] bg-[#FAF8F5] px-3 py-2 text-xs font-medium text-[#1C1B19]"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>

          <label className="inline-flex items-center gap-2 text-xs text-[#3A3732]">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-md border border-[#CFC7B8] bg-[#FAF8F5] px-2.5 py-1.5 text-xs text-[#1C1B19] focus:border-[#2E473B] focus:outline-none"
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Reviewed</option>
            </select>
          </label>

          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 rounded-md border border-[#DFD8CC] bg-[#FAF8F5] px-3 py-1.5 text-xs text-[#5C5852] hover:text-[#1C1B19]"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Catalogue Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sidebar Filters */}
        <aside
          className={`lg:col-span-3 space-y-6 rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] p-5 self-start ${
            mobileFiltersOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Category Filter */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-semibold tracking-wide text-[#1C1B19]">
              Product Category
            </h2>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left rounded px-2.5 py-1.5 text-xs transition-colors ${
                  selectedCategory === ''
                    ? 'bg-[#2E473B] text-[#FAF8F5] font-medium'
                    : 'text-[#4E4B45] hover:bg-[#EFEBE2]'
                }`}
              >
                All Categories
              </button>
              {categories
                .filter((c) => c.groupSlug !== 'services')
                .map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left rounded px-2.5 py-1.5 text-xs transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-[#2E473B] text-[#FAF8F5] font-medium'
                        : 'text-[#4E4B45] hover:bg-[#EFEBE2]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
            </div>
          </div>

          {/* Tradition Navigation Filter */}
          <div className="border-t border-[#E5DEC9] pt-5 space-y-2.5">
            <div className="space-y-1">
              <h2 className="text-xs font-semibold tracking-wide text-[#1C1B19]">
                Tradition Filter (Optional)
              </h2>
              <p className="text-[11px] text-[#6E6A63]">
                Navigation aid only. You can browse all products without selecting a tradition.
              </p>
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedTradition('')}
                className={`w-full text-left rounded px-2.5 py-1.5 text-xs transition-colors ${
                  selectedTradition === ''
                    ? 'bg-[#2E473B] text-[#FAF8F5] font-medium'
                    : 'text-[#4E4B45] hover:bg-[#EFEBE2]'
                }`}
              >
                All Traditions (No Filter)
              </button>
              {traditions.map((trad) => (
                <button
                  key={trad.id}
                  type="button"
                  onClick={() => setSelectedTradition(trad.slug)}
                  className={`w-full text-left rounded px-2.5 py-1.5 text-xs transition-colors ${
                    selectedTradition === trad.slug
                      ? 'bg-[#2E473B] text-[#FAF8F5] font-medium'
                      : 'text-[#4E4B45] hover:bg-[#EFEBE2]'
                  }`}
                >
                  {trad.name}
                </button>
              ))}
            </div>
          </div>

          {/* Item Designation Filter */}
          <div className="border-t border-[#E5DEC9] pt-5 space-y-2.5">
            <h2 className="text-xs font-semibold tracking-wide text-[#1C1B19]">
              Requirement Designation
            </h2>
            <div className="space-y-1">
              {[
                { value: '', label: 'All Designations' },
                { value: 'ESSENTIAL', label: 'Commonly Essential' },
                { value: 'OPTIONAL', label: 'Optional Addition' },
                { value: 'REGION_DEPENDENT', label: 'Region-Dependent' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setSelectedDesignation(opt.value)}
                  className={`w-full text-left rounded px-2.5 py-1.5 text-xs transition-colors ${
                    selectedDesignation === opt.value
                      ? 'bg-[#2E473B] text-[#FAF8F5] font-medium'
                      : 'text-[#4E4B45] hover:bg-[#EFEBE2]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range & Stock Availability */}
          <div className="border-t border-[#E5DEC9] pt-5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="price-range-slider" className="font-semibold text-[#1C1B19]">
                  Max Product Price
                </label>
                <span className="font-mono tabular-nums text-[#2E473B]">
                  ₹{maxPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                id="price-range-slider"
                type="range"
                min={250}
                max={3500}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#2E473B]"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-[#3A3732] cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded border-[#CFC7B8] accent-[#2E473B]"
              />
              <span>Show in-stock items only</span>
            </label>
          </div>
        </aside>

        {/* Main Results Column */}
        <div className="lg:col-span-9 space-y-10">
          {/* Active Tradition Qualification Notice */}
          {activeTraditionNote && (
            <div className="rounded-lg border border-[#DFD8CC] bg-[#F4F0E6] p-5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif text-xl font-semibold text-[#1C1B19]">
                  {activeTraditionNote.name}
                </h2>
                <span className="text-xs text-[#6E6A63]">
                  Reviewed by {activeTraditionNote.reviewerName} · {activeTraditionNote.lastReviewedAt}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-[#4E4B45]">
                {activeTraditionNote.regionalQualificationNote}
              </p>
            </div>
          )}

          {/* Ritual Kits Section (when applicable) */}
          {(showKitsFirst || filteredKits.length > 0) && (
            <section className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-[#E5DEC9] pb-3">
                <h2 className="font-serif text-2xl font-semibold text-[#1C1B19]">
                  Curated Ritual Kits ({filteredKits.length})
                </h2>
                <span className="text-xs text-[#6E6A63]">
                  Click any kit to open the interactive Ritual Kit Builder
                </span>
              </div>

              {filteredKits.length === 0 ? (
                <p className="text-xs text-[#5C5852]">
                  No ritual kits match your current filter selection.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {filteredKits.map((kit) => (
                    <RitualKitCard key={kit.id} kit={kit} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Individual Products Section */}
          {!showKitsFirst && (
            <section className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-[#E5DEC9] pb-3">
                <h2 className="font-serif text-2xl font-semibold text-[#1C1B19]">
                  Individual Products ({filteredProducts.length})
                </h2>
                <span className="text-xs text-[#6E6A63]">
                  All prices in INR · Verified stock &amp; specifications
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-lg border border-[#E5DEC9] bg-[#FAF8F5] p-10 text-center space-y-3">
                  <p className="text-base font-medium text-[#1C1B19]">
                    No products match your selected filters.
                  </p>
                  <p className="text-xs text-[#5C5852]">
                    Try expanding your price range or clearing the category/tradition filter.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#2E473B] px-4 py-2 text-xs font-medium text-[#FAF8F5]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
