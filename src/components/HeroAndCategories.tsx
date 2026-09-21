import { useMemo } from "react";
import { ArrowRight, ShieldCheck, Sparkle, Truck, Clock } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useStore } from "../context/StoreContext";
import type { Category } from "../types";

const CATEGORY_STYLES: Record<Category, { bg: string; label: string; emoji: string; ring: string }> = {
  Electronics: {
    bg: "from-indigo-950 via-indigo-800 to-blue-700",
    label: "text-indigo-200",
    emoji: "◉",
    ring: "group-hover:ring-indigo-400/60",
  },
  Fashion: {
    bg: "from-stone-900 via-stone-700 to-stone-500",
    label: "text-stone-300",
    emoji: "✦",
    ring: "group-hover:ring-stone-400/60",
  },
  "Home & Living": {
    bg: "from-emerald-950 via-emerald-700 to-teal-600",
    label: "text-emerald-200",
    emoji: "⌂",
    ring: "group-hover:ring-emerald-400/60",
  },
  Accessories: {
    bg: "from-amber-950 via-amber-700 to-orange-600",
    label: "text-amber-200",
    emoji: "◆",
    ring: "group-hover:ring-amber-400/60",
  },
};

const FEATURES = [
  { icon: Truck, title: "Fast Delivery", sub: "2-4 day express" },
  { icon: ShieldCheck, title: "Secure Checkout", sub: "Encrypted payments" },
  { icon: Sparkle, title: "Verified Reviews", sub: "Real customer picks" },
];

export default function HeroAndCategories() {
  const { products, setFilters, categories } = useStore();

  const categoryCounts = useMemo(() => {
    const map = new Map<Category, number>();
    for (const p of products) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return map;
  }, [products]);

  const featuredCount = products.filter((p) => p.isFeatured).length;

  return (
    <section className="relative">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-24 size-[480px] rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="absolute top-20 right-0 size-[420px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-[380px] rounded-full bg-sky-100/60 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-16 sm:pt-14 sm:pb-20">
        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 backdrop-blur px-3 py-1.5 mb-6">
              <span className="size-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-700 tracking-wide uppercase">
                Summer collection is live
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tighter leading-[1.05] text-zinc-900">
              Everyday things,
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">
                elevated.
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-zinc-600 leading-relaxed max-w-[46ch]">
              Thoughtfully designed electronics, apparel and home goods. Curated once, delivered
              fast, backed by a no-questions returns policy.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-[0.98] transition-all"
              >
                Shop Collection
                <ArrowRight size={17} weight="bold" />
              </button>
              <button
                onClick={() => setFilters({ category: "All", sortBy: "rating" })}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-zinc-300 bg-white/80 text-zinc-800 text-sm font-bold hover:border-zinc-400 hover:bg-white active:scale-[0.98] transition-all"
              >
                <Sparkle size={17} className="text-amber-500" />
                {featuredCount} Picks
              </button>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex items-center gap-2.5 rounded-2xl border border-zinc-200/80 bg-white/70 backdrop-blur px-3.5 py-2.5 shadow-sm"
                >
                  <span className="grid place-items-center size-8 rounded-lg bg-indigo-50 text-indigo-600">
                    <f.icon size={17} weight="bold" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-zinc-900 leading-none">{f.title}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero visual: stacked product collage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="relative hidden sm:block"
          >
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-blue-700 shadow-2xl shadow-indigo-900/30 ring-1 ring-white/20">
              {products.slice(0, 3).map((p, i) => (
                <motion.img
                  key={p.id}
                  src={p.image}
                  alt={p.title}
                  loading="eager"
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 5 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.7,
                  }}
                  className="absolute rounded-2xl object-cover shadow-xl ring-1 ring-white/30"
                  style={{
                    width: "46%",
                    aspectRatio: "1/1",
                    inset: i === 0 ? "6% 6% auto auto" : i === 1 ? "auto auto 8% 8%" : "10% 42% auto auto",
                    zIndex: i === 2 ? 5 : i === 1 ? 4 : 3,
                  }}
                />
              ))}
              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur-md px-3 py-2 ring-1 ring-white/25">
                <Clock size={15} className="text-indigo-100" />
                <span className="text-xs font-bold text-white">New drops weekly</span>
              </div>
            </div>

            {/* Floating stat chip */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
              className="absolute -bottom-5 right-6 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-zinc-900/10 ring-1 ring-zinc-200"
            >
              <p className="text-xl font-extrabold text-zinc-900 leading-none">{products.length}</p>
              <p className="text-[11px] font-medium text-zinc-500 mt-1">curated products</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Category showcase */}
        <div className="mt-16 sm:mt-20">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                Shop by category
              </h2>
              <p className="text-sm text-zinc-500 mt-1">Jump straight to what you came for</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => {
              const style = CATEGORY_STYLES[cat];
              return (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.07, ease: "easeOut" }}
                  onClick={() => {
                    setFilters({ category: cat });
                    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${style.bg} p-6 text-left text-white shadow-lg ring-1 ring-white/10 transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98] ${style.ring} focus-visible:outline-none focus-visible:ring-2`}
                >
                  <span className="pointer-events-none absolute -top-4 -right-2 text-[90px] leading-none opacity-15 select-none">
                    {style.emoji}
                  </span>
                  <span className="inline-grid place-items-center size-9 rounded-xl bg-white/15 backdrop-blur text-lg mb-10">
                    {style.emoji}
                  </span>
                  <p className="text-lg font-extrabold tracking-tight">{cat}</p>
                  <p className={`text-xs font-semibold mt-1 ${style.label}`}>
                    {categoryCounts.get(cat) ?? 0} products
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold opacity-75 group-hover:opacity-100 group-hover:gap-2 transition-all">
                    Browse
                    <ArrowRight size={13} weight="bold" />
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}