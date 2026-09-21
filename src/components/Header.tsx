import { useEffect, useRef, useState } from "react";
import {
  CaretDown,
  Heart,
  MagnifyingGlass,
  SignOut,
  ShoppingCart,
  Storefront,
  User,
  X,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, initials } from "../context/StoreContext";
import type { Category } from "../types";
import { cn } from "../lib/utils";

const NAV_CATEGORIES: Category[] = ["Electronics", "Fashion", "Home & Living", "Accessories"];

export default function Header() {
  const {
    user,
    cartCount,
    wishlistCount,
    openCart,
    openAuth,
    logout,
    query,
    setQuery,
    setFilters,
    filters,
  } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDropOpen(false);
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectCategory = (cat: Category) => {
    setFilters({ category: cat });
    setDropOpen(false);
    setMenuOpen(false);
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-40">
      {/* Announcement bar */}
      <div className="bg-indigo-950 text-indigo-100 text-[13px]">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-center gap-2 text-center">
          <Storefront size={15} weight="duotone" className="text-indigo-300 shrink-0" />
          <span>Free worldwide shipping on orders over $150</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-white/85 backdrop-blur-xl border-b border-zinc-200/80 shadow-[0_1px_0_0_rgba(9,9,11,0.02)]">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-3 md:gap-6">
          {/* Brand */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 shrink-0 group"
          >
            <span className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-transform">
              <Storefront size={19} weight="fill" />
            </span>
            <span className="text-lg font-bold tracking-tight text-zinc-900 hidden sm:block">
              lumen<span className="text-indigo-600">.</span>
            </span>
          </a>

          {/* Category nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  filters.category === cat
                    ? "text-indigo-700 bg-indigo-50"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                )}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* Search (desktop) */}
          <div ref={searchRef} className="relative flex-1 max-w-md ml-auto hidden md:block">
            <div className="relative">
              <MagnifyingGlass
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setDropOpen(true)}
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full h-10 rounded-xl border border-zinc-200 bg-zinc-50/80 pl-10 pr-9 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 grid place-items-center size-6 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <AnimatePresence>
              {dropOpen && query.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-11 inset-x-0 z-50 rounded-xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/5 p-1.5"
                >
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-zinc-800">
                      Showing results for &quot;{query}&quot;
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Press Enter or browse the catalog below
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDropOpen(false);
                      document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 transition-colors"
                  >
                    View results
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto md:ml-0">
            <button
              onClick={() => setFilters({ category: "All" })}
              aria-label="Wishlist"
              className="relative grid place-items-center size-10 rounded-xl text-zinc-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Heart size={21} className={cn(wishlistCount > 0 && "text-rose-500")} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 size-2 rounded-full bg-rose-500" />
              )}
            </button>

            <button
              onClick={openCart}
              aria-label="Open cart"
              className="relative grid place-items-center size-10 rounded-xl text-zinc-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <ShoppingCart size={21} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold grid place-items-center shadow-md shadow-indigo-600/40"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-2 h-10 rounded-xl hover:bg-zinc-100 transition-colors"
                  aria-label="Account menu"
                >
                  <span
                    className={cn(
                      "grid place-items-center size-7 rounded-full bg-gradient-to-br text-white text-xs font-bold",
                      user.avatar
                    )}
                  >
                    {initials(user.name)}
                  </span>
                  <span className="hidden lg:block text-sm font-semibold text-zinc-800 max-w-[110px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                  <CaretDown size={13} className="text-zinc-400" />
                </button>
                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl shadow-zinc-900/10"
                    >
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-50">
                        <span
                          className={cn(
                            "grid place-items-center size-10 rounded-full bg-gradient-to-br text-white text-sm font-bold",
                            user.avatar
                          )}
                        >
                          {initials(user.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-zinc-900 truncate">{user.name}</p>
                          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setDropOpen(false);
                        }}
                        className="mt-1.5 w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <SignOut size={17} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => openAuth("login")}
                className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 active:scale-[0.98] transition-all"
              >
                <User size={16} />
                Sign In
              </button>
            )}

            {/* Mobile search trigger */}
            <a
              href="#catalog"
              className="grid place-items-center size-10 rounded-xl text-zinc-600 hover:bg-zinc-100 md:hidden"
              aria-label="Browse catalog"
            >
              <MagnifyingGlass size={21} />
            </a>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <MagnifyingGlass
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full h-10 rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-9 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 grid place-items-center size-6 rounded-full text-zinc-400 hover:text-zinc-700"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile category pills */}
      <div className="lg:hidden bg-white/85 backdrop-blur-xl border-b border-zinc-200/80">
        <div className="mx-auto max-w-7xl px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {NAV_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-colors",
                filters.category === cat
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-zinc-200 text-zinc-600 hover:border-indigo-300 hover:text-indigo-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}