import { useEffect, useState } from "react";
import { ArrowUp, Heart, MapPin, Storefront as StorefrontIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { StoreProvider, useStore } from "./context/StoreContext";
import Header from "./components/Header";
import HeroAndCategories from "./components/HeroAndCategories";
import ProductCatalog from "./components/ProductCatalog";
import { StoreOverlays } from "./components/ModalsAndDrawers";

const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: ["New arrivals", "Electronics", "Fashion", "Home & Living", "Gift cards"],
  },
  {
    title: "Company",
    links: ["About lumen", "Careers", "Sustainability", "Press", "Affiliates"],
  },
  {
    title: "Support",
    links: ["Help center", "Shipping & returns", "Order tracking", "Size guide", "Contact us"],
  },
];

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 640);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-5 right-5 z-40 hidden md:grid place-items-center size-11 rounded-full bg-white border border-zinc-200 text-zinc-700 shadow-xl shadow-zinc-900/10 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
        >
          <ArrowUp size={19} weight="bold" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function Storefront() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/70 text-zinc-900 antialiased">
      <Header />
      <main className="flex-1">
        <HeroAndCategories />
        <ProductCatalog />
      </main>

      {/* Divider banner */}
      <section className="relative overflow-hidden bg-indigo-950">
        <div className="absolute -top-20 right-0 size-72 rounded-full bg-indigo-600/30 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 -left-10 size-64 rounded-full bg-blue-600/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-12 flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight text-center sm:text-left">
            New drops land every Thursday.
            <span className="block text-sm font-semibold text-indigo-300 mt-1">
              Join the waitlist for early access to limited runs.
            </span>
          </p>
          <button
            onClick={() =>
              document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })
            }
            className="shrink-0 h-12 px-7 rounded-xl bg-white text-indigo-950 text-sm font-extrabold hover:bg-indigo-100 active:scale-[0.98] transition-all shadow-lg"
          >
            Browse the catalog
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200/80">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <span className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-600/25">
                  <StorefrontIcon size={18} weight="fill" />
                </span>
                <span className="text-lg font-bold tracking-tight">
                  lumen<span className="text-indigo-600">.</span>
                </span>
              </div>
              <p className="mt-4 text-sm text-zinc-500 leading-relaxed max-w-xs">
                Curated everyday essentials — electronics, apparel and home goods — designed to
                last and shipped to 40+ countries.
              </p>
              <div className="mt-5 flex flex-col gap-2 text-sm text-zinc-500">
                <span className="flex items-center gap-2">
                  <MapPin size={15} className="text-indigo-500" />
                  88 Market Street, San Francisco, CA
                </span>
                <span className="flex items-center gap-2">
                  <Heart size={15} className="text-rose-400" />
                  Designed with care for the planet
                </span>
              </div>
            </div>
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-extrabold text-zinc-900 mb-3">{col.title}</h3>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#catalog"
                        onClick={(e) => e.preventDefault()}
                        className="text-sm text-zinc-500 hover:text-indigo-600 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-zinc-400">
              © {new Date().getFullYear()} lumen.shop — A demo storefront. All payments are simulated.
            </p>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <StorefrontIcon size={13} className="text-indigo-400" />
              Built with React, Framer Motion & Phosphor
            </p>
          </div>
        </div>
      </footer>

      <StoreOverlays />
      <BackToTop />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Storefront />
      <Toaster position="bottom-right" richColors closeButton toastOptions={{ className: "!font-sans" }} />
    </StoreProvider>
  );
}