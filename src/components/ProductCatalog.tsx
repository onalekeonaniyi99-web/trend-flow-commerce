import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Heart,
  MagnifyingGlass,
  Package,
  SlidersHorizontal,
  Star,
  Tag,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../context/StoreContext";
import type { Category, Product, SortOption } from "../types";
import { cn } from "../lib/utils";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

function PriceChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-semibold text-zinc-600">
      <Tag size={11} className="text-indigo-500" />
      {label} {value}
    </span>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          weight={rating >= i ? "fill" : "regular"}
          className={rating >= i - 0.5 ? "text-amber-400" : "text-zinc-300"}
        />
      ))}
    </span>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addToCart, toggleWishlist, wishlist, openQuickView } = useStore();
  const [added, setAdded] = useState(false);
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const wished = wishlist.includes(product.id);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.05, ease: "easeOut" }}
      className="group relative flex flex-col rounded-2xl border border-zinc-200/90 bg-white overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-900/8"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-zinc-100">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-md bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-3 right-3 grid place-items-center size-9 rounded-full backdrop-blur transition-all active:scale-90",
            wished
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
              : "bg-white/85 text-zinc-500 hover:text-rose-500 hover:bg-white"
          )}
        >
          <Heart size={16} weight={wished ? "fill" : "regular"} />
        </button>

        {/* Quick view (hover) */}
        <button
          onClick={() => openQuickView(product)}
          className="absolute bottom-3 inset-x-3 h-10 rounded-xl bg-white/90 backdrop-blur text-sm font-bold text-zinc-900 shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
        >
          Quick View
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            {product.category}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 text-[11px] font-semibold",
              product.inStock ? "text-emerald-600" : "text-rose-500"
            )}
          >
            <span className={cn("size-1.5 rounded-full", product.inStock ? "bg-emerald-500" : "bg-rose-500")} />
            {product.inStock ? "In stock" : "Sold out"}
          </span>
        </div>
        <h3 className="mt-1.5 text-[15px] font-bold text-zinc-900 leading-snug line-clamp-1">
          {product.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-2">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-zinc-500 font-medium">
            {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()})
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.tags.slice(0, 2).map((t) => (
            <PriceChip key={t} label="" value={t} />
          ))}
        </div>
        <div className="mt-auto pt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-extrabold text-zinc-900 leading-none">
              ${product.price.toFixed(2)}
            </p>
            {discount > 0 && (
              <p className="mt-1 text-xs text-zinc-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </p>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={cn(
              "inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-[13px] font-bold transition-all active:scale-[0.97]",
              added
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "bg-zinc-900 text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-600/30",
              !product.inStock && "opacity-40 cursor-not-allowed"
            )}
          >
            {added ? "Added!" : "Add to Cart"}
            {!added && <ArrowRight size={14} weight="bold" />}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function ProductCatalog() {
  const { products, filters, setFilters, resetFilters, query, categories } = useStore();
  const [localMin, setLocalMin] = useState(filters.minPrice);
  const [localMax, setLocalMax] = useState(filters.maxPrice);
  const [priceOpen, setPriceOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const priceRange = useMemo(() => {
    const prices = products.map((p) => p.price);
    return { min: Math.floor(Math.min(...prices) / 10) * 10, max: Math.ceil(Math.max(...prices) / 10) * 10 };
  }, [products]);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (filters.category !== "All" && p.category !== filters.category) return false;
      if (filters.inStockOnly && !p.inStock) return false;
      if (filters.searchQuery && !p.title.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
      if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
      return true;
    });
    switch (filters.sortBy) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list = [...list].sort((a, b) => b.createdAt - a.createdAt);
        break;
      default:
        list = [...list].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }
    return list;
  }, [products, filters]);

  const applyPrice = () => {
    setFilters({
      minPrice: Math.min(localMin, localMax),
      maxPrice: Math.max(localMin, localMax),
    });
    setPriceOpen(false);
  };

  return (
    <section id="catalog" className="relative mx-auto max-w-7xl px-4 py-14 sm:py-18 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 mb-1">
            The Catalog
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
            {filters.category === "All" ? "All products" : filters.category}
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            {filtered.length} of {products.length} products
            {query && (
              <>
                {" "}
                matching &quot;<span className="text-indigo-600 font-semibold">{query}</span>&quot;
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Price filter */}
          <div className="relative">
            <button
              onClick={() => setPriceOpen((v) => !v)}
              className={cn(
                "inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border text-sm font-semibold transition-colors",
                (filters.minPrice !== priceRange.min || filters.maxPrice !== priceRange.max)
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
              )}
            >
              <SlidersHorizontal size={15} />
              Price
            </button>
            <AnimatePresence>
              {priceOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 z-30 w-72 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl shadow-zinc-900/10"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="number"
                      value={localMin}
                      min={priceRange.min}
                      max={priceRange.max}
                      onChange={(e) => setLocalMin(Number(e.target.value) || 0)}
                      className="h-9 w-full rounded-lg border border-zinc-200 px-2.5 text-sm outline-none focus:border-indigo-400"
                    />
                    <span className="text-zinc-400">–</span>
                    <input
                      type="number"
                      value={localMax}
                      min={priceRange.min}
                      max={priceRange.max}
                      onChange={(e) => setLocalMax(Number(e.target.value) || 0)}
                      className="h-9 w-full rounded-lg border border-zinc-200 px-2.5 text-sm outline-none focus:border-indigo-400"
                    />
                  </div>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={localMin}
                    onChange={(e) => setLocalMin(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                    aria-label="Minimum price"
                  />
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-medium mt-1 mb-4">
                    <span>${localMin}</span>
                    <span>${localMax}</span>
                  </div>
                  <button
                    onClick={applyPrice}
                    className="w-full h-10 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Apply price range
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stock toggle */}
          <button
            onClick={() => setFilters({ inStockOnly: !filters.inStockOnly })}
            className={cn(
              "inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border text-sm font-semibold transition-colors",
              filters.inStockOnly
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
            )}
          >
            <span
              className={cn(
                "relative w-8 h-[18px] rounded-full transition-colors",
                filters.inStockOnly ? "bg-emerald-500" : "bg-zinc-300"
              )}
            >
              <span
                className={cn(
                  "absolute top-[2px] size-[14px] rounded-full bg-white shadow transition-all",
                  filters.inStockOnly ? "left-[16px]" : "left-[2px]"
                )}
              />
            </span>
            In stock
          </button>

          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ sortBy: e.target.value as SortOption })}
            aria-label="Sort products"
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none focus:border-indigo-400 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-1">
        <button
          onClick={() => setFilters({ category: "All" })}
          className={cn(
            "shrink-0 px-4 h-9 rounded-full text-sm font-bold transition-all",
            filters.category === "All"
              ? "bg-zinc-900 text-white shadow-md"
              : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilters({ category: cat })}
            className={cn(
              "shrink-0 px-4 h-9 rounded-full text-sm font-bold transition-all",
              filters.category === cat
                ? "bg-zinc-900 text-white shadow-md"
                : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200/90 bg-white overflow-hidden animate-pulse">
              <div className="aspect-square bg-zinc-100" />
              <div className="p-4 space-y-2.5">
                <div className="h-3 w-1/3 rounded bg-zinc-100" />
                <div className="h-4 w-3/4 rounded bg-zinc-100" />
                <div className="h-3 w-1/2 rounded bg-zinc-100" />
                <div className="h-9 w-full rounded-xl bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white py-20 px-6 text-center"
        >
          <span className="grid place-items-center size-16 rounded-2xl bg-zinc-100 text-zinc-400 mb-4">
            {query ? <MagnifyingGlass size={28} /> : <Package size={28} />}
          </span>
          <h3 className="text-lg font-extrabold text-zinc-900">
            {query ? `No results for "${query}"` : "Nothing here yet"}
          </h3>
          <p className="text-sm text-zinc-500 mt-1.5 max-w-sm">
            Try a different search term, adjust your price range, or clear the active filters.
          </p>
          <button
            onClick={resetFilters}
            className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-indigo-600 transition-colors"
          >
            Reset all filters
            <ArrowRight size={15} weight="bold" />
          </button>
        </motion.div>
      )}
    </section>
  );
}