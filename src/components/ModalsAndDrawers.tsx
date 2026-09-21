import { useEffect, useMemo, useState } from "react";
import {
  AppleLogo,
  CaretRight,
  Check,
  CheckCircle,
  Heart,
  CreditCard,
  GithubLogo,
  GoogleLogo,
  Lock,
  MapPin,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Truck,
  X,
} from "@phosphor-icons/react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { toast } from "sonner";
import { useStore, initials } from "../context/StoreContext";
import type { CheckoutInfo } from "../types";
import { cn } from "../lib/utils";

/* ------------------------------ Shared shell ------------------------------ */

function Overlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-zinc-950/45 backdrop-blur-[2px]"
      aria-hidden
    />
  );
}

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
}

const panelVariants: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 32 } },
  exit: { x: "100%", transition: { duration: 0.22, ease: "easeIn" } },
};

/* ------------------------------- Cart drawer ------------------------------ */

function CartDrawer() {
  const {
    cartOpen,
    closeCart,
    cart,
    updateQuantity,
    removeFromCart,
    summary,
    applyPromo,
    openCheckout,
    clearCart,
  } = useStore();
  const [promo, setPromo] = useState("");

  useEscape(cartOpen, closeCart);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <Overlay onClose={closeCart} />
          <motion.aside
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-zinc-100 shrink-0">
              <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2">
                <ShoppingCart size={20} weight="duotone" className="text-indigo-600" />
                Your Cart
                <span className="text-sm font-semibold text-zinc-400">
                  ({cart.reduce((n, i) => n + i.quantity, 0)})
                </span>
              </h2>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="grid place-items-center size-9 rounded-xl text-zinc-500 hover:bg-zinc-100"
              >
                <X size={18} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <span className="grid place-items-center size-20 rounded-3xl bg-indigo-50 text-indigo-500 mb-5">
                  <ShoppingCart size={34} weight="duotone" />
                </span>
                <h3 className="text-lg font-extrabold text-zinc-900">Your cart is empty</h3>
                <p className="text-sm text-zinc-500 mt-1.5">
                  Add a few curated picks and they will show up here.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-6 inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                  Start shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {cart.map(({ product, quantity }) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="flex gap-3.5 rounded-2xl border border-zinc-100 p-3"
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        className="size-20 rounded-xl object-cover bg-zinc-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-900 truncate">{product.title}</p>
                        <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                          ${product.price.toFixed(2)}
                        </p>
                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-zinc-200">
                            <button
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              aria-label="Decrease quantity"
                              className="grid place-items-center size-7 text-zinc-600 hover:bg-zinc-100 rounded-l-lg"
                            >
                              <Minus size={12} weight="bold" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-zinc-900">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              aria-label="Increase quantity"
                              className="grid place-items-center size-7 text-zinc-600 hover:bg-zinc-100 rounded-r-lg"
                            >
                              <Plus size={12} weight="bold" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(product.id)}
                            aria-label={`Remove ${product.title}`}
                            className="grid place-items-center size-8 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <button
                    onClick={clearCart}
                    className="text-xs font-semibold text-zinc-400 hover:text-rose-500 transition-colors"
                  >
                    Clear cart
                  </button>
                </div>

                {/* Summary */}
                <div className="shrink-0 border-t border-zinc-100 px-5 py-4 space-y-3 bg-zinc-50/60">
                  <div className="flex gap-2">
                    <input
                      value={promo}
                      onChange={(e) => setPromo(e.target.value)}
                      placeholder="Promo code (try LUMEN10)"
                      className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3.5 text-sm outline-none focus:border-indigo-400"
                    />
                    <button
                      onClick={() => {
                        if (applyPromo(promo)) setPromo("");
                      }}
                      className="h-10 px-4 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-zinc-900">
                        ${summary.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Estimated tax (8%)</span>
                      <span className="font-semibold text-zinc-900">${summary.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Shipping</span>
                      <span className="font-semibold text-zinc-900">
                        {summary.shipping === 0 ? (
                          <span className="text-emerald-600">Free</span>
                        ) : (
                          `$${summary.shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    {summary.discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Promo ({summary.promoCode})</span>
                        <span className="font-semibold">-${summary.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-extrabold text-zinc-900 pt-2 border-t border-zinc-200">
                      <span>Total</span>
                      <span>${summary.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={openCheckout}
                    className="w-full h-12 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/25"
                  >
                    Checkout · ${summary.total.toFixed(2)}
                  </button>
                  {summary.subtotal < 150 && summary.subtotal > 0 && (
                    <p className="text-xs text-zinc-500 text-center flex items-center justify-center gap-1.5">
                      <Truck size={13} className="text-indigo-500" />
                      Add ${(150 - summary.subtotal).toFixed(2)} more for free shipping
                    </p>
                  )}
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------ Checkout modal ---------------------------- */

const EMPTY_CHECKOUT: CheckoutInfo = {
  fullName: "",
  address: "",
  city: "",
  zip: "",
  country: "United States",
  paymentMethod: "card",
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
};

function CheckoutModal() {
  const { checkoutOpen, closeCheckout, cart, summary, placeOrder, user, openAuth } = useStore();
  const [info, setInfo] = useState<CheckoutInfo>(EMPTY_CHECKOUT);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEscape(checkoutOpen, closeCheckout);

  useEffect(() => {
    if (checkoutOpen) {
      setInfo((prev) => ({ ...prev, fullName: user ? user.name : prev.fullName }));
      setErrors([]);
    }
  }, [checkoutOpen, user]);

  const set = (patch: Partial<CheckoutInfo>) => setInfo((prev) => ({ ...prev, ...patch }));

  const validate = () => {
    const errs: string[] = [];
    if (info.fullName.trim().length < 2) errs.push("Full name is required");
    if (info.address.trim().length < 5) errs.push("Street address is required");
    if (info.city.trim().length < 2) errs.push("City is required");
    if (info.zip.trim().length < 3) errs.push("ZIP / postal code is required");
    if (info.paymentMethod === "card") {
      if (info.cardNumber.replace(/\s/g, "").length < 12) errs.push("Enter a valid card number");
      if (!/^\d{2}\/\d{2}$/.test(info.cardExpiry)) errs.push("Expiry must be MM/YY");
      if (info.cardCvc.length < 3) errs.push("CVC is required");
    }
    setErrors(errs);
    return errs.length === 0;
  };

  const submit = async () => {
    if (!user) {
      toast.error("Please sign in before placing your order");
      closeCheckout();
      openAuth("login");
      return;
    }
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setProcessing(true);
    try {
      await placeOrder(info);
      setInfo(EMPTY_CHECKOUT);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setProcessing(false);
    }
  };

  const inputCls = (bad: boolean) =>
    cn(
      "h-11 w-full rounded-xl border bg-white px-3.5 text-sm outline-none transition-colors",
      bad ? "border-rose-300 focus:border-rose-400" : "border-zinc-200 focus:border-indigo-400"
    );

  return (
    <AnimatePresence>
      {checkoutOpen && (
        <>
          <Overlay onClose={closeCheckout} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-100">
                <div>
                  <h2 className="text-xl font-extrabold text-zinc-900">Checkout</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {cart.length} item{cart.length !== 1 && "s"} ·{" "}
                    <span className="font-bold text-zinc-700">${summary.total.toFixed(2)}</span>
                  </p>
                </div>
                <button
                  onClick={closeCheckout}
                  aria-label="Close checkout"
                  className="grid place-items-center size-9 rounded-xl text-zinc-500 hover:bg-zinc-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Shipping */}
                <section>
                  <h3 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2 mb-3">
                    <MapPin size={16} className="text-indigo-600" />
                    Shipping address
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={info.fullName}
                      onChange={(e) => set({ fullName: e.target.value })}
                      placeholder="Full name"
                      className={cn(inputCls(errors.includes("Full name is required")), "col-span-2")}
                    />
                    <input
                      value={info.address}
                      onChange={(e) => set({ address: e.target.value })}
                      placeholder="Street address"
                      className={cn(inputCls(errors.includes("Street address is required")), "col-span-2")}
                    />
                    <input
                      value={info.city}
                      onChange={(e) => set({ city: e.target.value })}
                      placeholder="City"
                      className={inputCls(errors.includes("City is required"))}
                    />
                    <input
                      value={info.zip}
                      onChange={(e) => set({ zip: e.target.value })}
                      placeholder="ZIP / Postal code"
                      className={inputCls(errors.includes("ZIP / postal code is required"))}
                    />
                    <select
                      value={info.country}
                      onChange={(e) => set({ country: e.target.value })}
                      className={cn(inputCls(false), "col-span-2 cursor-pointer")}
                    >
                      {["United States", "Canada", "United Kingdom", "Germany", "France", "Australia"].map(
                        (c) => (
                          <option key={c}>{c}</option>
                        )
                      )}
                    </select>
                  </div>
                </section>

                {/* Payment */}
                <section>
                  <h3 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2 mb-3">
                    <CreditCard size={16} className="text-indigo-600" />
                    Payment method
                  </h3>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {(
                      [
                        { key: "card", label: "Card", icon: null },
                        { key: "applepay", label: "Apple Pay", icon: <AppleLogo size={16} weight="fill" /> },
                        { key: "paypal", label: "PayPal", icon: null },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.key}
                        onClick={() => set({ paymentMethod: m.key })}
                        className={cn(
                          "h-11 rounded-xl border text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all",
                          info.paymentMethod === m.key
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200"
                            : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                        )}
                      >
                        {m.icon}
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {info.paymentMethod === "card" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={info.cardNumber}
                        onChange={(e) =>
                          set({
                            cardNumber: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 16)
                              .replace(/(\d{4})(?=\d)/g, "$1 "),
                          })
                        }
                        placeholder="Card number"
                        inputMode="numeric"
                        className={cn(inputCls(errors.includes("Enter a valid card number")), "col-span-2")}
                      />
                      <input
                        value={info.cardExpiry}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                          set({ cardExpiry: v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v });
                        }}
                        placeholder="MM/YY"
                        inputMode="numeric"
                        className={inputCls(errors.includes("Expiry must be MM/YY"))}
                      />
                      <input
                        value={info.cardCvc}
                        onChange={(e) => set({ cardCvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                        placeholder="CVC"
                        inputMode="numeric"
                        className={inputCls(errors.includes("CVC is required"))}
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 text-center">
                      <p className="text-xs text-zinc-500">
                        You will be redirected to{" "}
                        <span className="font-bold text-zinc-800">
                          {info.paymentMethod === "applepay" ? "Apple Pay" : "PayPal"}
                        </span>{" "}
                        to complete the payment (simulated).
                      </p>
                    </div>
                  )}
                  {errors.length > 0 && (
                    <div className="mt-3 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5">
                      <p className="text-xs font-bold text-rose-600 mb-1">Please fix the following:</p>
                      <ul className="text-xs text-rose-500 space-y-0.5">
                        {errors.map((e) => (
                          <li key={e}>• {e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>

                {/* Summary */}
                <section className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4 space-y-1.5 text-sm">
                  {cart.map(({ product, quantity }) => (
                    <div key={product.id} className="flex justify-between text-zinc-600">
                      <span className="truncate pr-3">
                        {product.title} <span className="text-zinc-400">×{quantity}</span>
                      </span>
                      <span className="font-semibold text-zinc-900 shrink-0">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-zinc-200 pt-2 space-y-1">
                    {summary.discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount</span>
                        <span>-${summary.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-extrabold text-zinc-900 text-base">
                      <span>Total</span>
                      <span>${summary.total.toFixed(2)}</span>
                    </div>
                  </div>
                </section>

                {!user && (
                  <p className="text-xs text-zinc-500 -mt-2">
                    Checking out requires an account.{" "}
                    <button
                      onClick={() => {
                        closeCheckout();
                        openAuth("login");
                      }}
                      className="font-bold text-indigo-600 hover:underline"
                    >
                      Sign in
                    </button>{" "}
                    to continue.
                  </p>
                )}

                <button
                  onClick={submit}
                  disabled={processing}
                  className={cn(
                    "w-full h-13 py-4 rounded-xl text-sm font-bold transition-all",
                    processing
                      ? "bg-zinc-300 text-zinc-600 cursor-wait"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 active:scale-[0.99]"
                  )}
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="size-4 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
                      Processing payment...
                    </span>
                  ) : (
                    `Place order · $${summary.total.toFixed(2)}`
                  )}
                </button>
                <p className="text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1 -mt-2">
                  <Lock size={11} /> Demo checkout — no real payment is processed
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------- Auth modal ------------------------------ */

function AuthModal() {
  const { authOpen, closeAuth, authMode, openAuth, login, signup, loginWithProvider } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEscape(authOpen, closeAuth);

  useEffect(() => {
    if (authOpen) {
      setError("");
      setName("");
      setEmail("");
      setPassword("");
    }
  }, [authOpen]);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      if (authMode === "login") await login(email, password);
      else await signup(name, email, password);
      closeAuth();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = () => {
    setEmail("demo@lumen.shop");
    setPassword("demo123");
    setError("");
  };

  return (
    <AnimatePresence>
      {authOpen && (
        <>
          <Overlay onClose={closeAuth} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 sm:p-8">
              {/* Tabs */}
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1 mb-6">
                {(["login", "signup"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => openAuth(mode)}
                    className={cn(
                      "h-10 rounded-lg text-sm font-bold transition-all",
                      authMode === mode ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
                    )}
                  >
                    {mode === "login" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>

              <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                {authMode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-sm text-zinc-500 mt-1 mb-6">
                {authMode === "login"
                  ? "Sign in to checkout faster and track your orders."
                  : "Join lumen to save favorites and unlock member pricing."}
              </p>

              <div className="space-y-3">
                {authMode === "signup" && (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                )}
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  type="email"
                  className="h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                />
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (6+ characters)"
                    type={showPw ? "text" : "password"}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    className="h-12 w-full rounded-xl border border-zinc-200 px-4 pr-12 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                  <button
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    {showPw ? <Package size={18} /> : <Lock size={18} />}
                  </button>
                </div>

                {error && (
                  <p className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-semibold text-rose-600">
                    {error}
                  </p>
                )}

                <button
                  onClick={submit}
                  disabled={busy}
                  className={cn(
                    "w-full h-12 rounded-xl text-sm font-bold transition-all",
                    busy
                      ? "bg-zinc-300 text-zinc-600 cursor-wait"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 active:scale-[0.99]"
                  )}
                >
                  {busy ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="size-4 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
                      Please wait...
                    </span>
                  ) : authMode === "login" ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="flex items-center gap-3 py-1">
                  <span className="flex-1 h-px bg-zinc-200" />
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase">or</span>
                  <span className="flex-1 h-px bg-zinc-200" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => loginWithProvider("google")}
                    disabled={busy}
                    className="h-12 rounded-xl border border-zinc-200 flex items-center justify-center gap-2 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <GoogleLogo size={18} className="text-rose-500" />
                    Google
                  </button>
                  <button
                    onClick={() => loginWithProvider("github")}
                    disabled={busy}
                    className="h-12 rounded-xl border border-zinc-200 flex items-center justify-center gap-2 text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <GithubLogo size={18} className="text-zinc-800" />
                    GitHub
                  </button>
                </div>

                {authMode === "login" && (
                  <button
                    onClick={fillDemo}
                    className="w-full text-xs font-semibold text-indigo-600 hover:underline py-1"
                  >
                    Use demo account (demo@lumen.shop / demo123)
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------ Quick view modal -------------------------- */

function QuickViewModal() {
  const { quickViewProduct, closeQuickView, addToCart, toggleWishlist, wishlist } = useStore();
  const [qty, setQty] = useState(1);
  const product = quickViewProduct;

  useEscape(!!product, closeQuickView);

  useEffect(() => setQty(1), [product?.id]);

  return (
    <AnimatePresence>
      {product && (
        <>
          <Overlay onClose={closeQuickView} />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl grid sm:grid-cols-2">
              <div className="relative aspect-square sm:aspect-auto sm:min-h-[380px] bg-zinc-100 overflow-hidden rounded-t-3xl sm:rounded-l-3xl">
                <img src={product.image} alt={product.title} className="absolute inset-0 size-full object-cover" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {product.isNew && (
                    <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      New
                    </span>
                  )}
                  {!product.inStock && (
                    <span className="rounded-md bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      Sold out
                    </span>
                  )}
                </div>
                <button
                  onClick={closeQuickView}
                  aria-label="Close quick view"
                  className="absolute top-3 right-3 grid place-items-center size-9 rounded-full bg-white/90 text-zinc-600 hover:bg-white shadow-md"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 sm:p-7 flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  {product.category}
                </span>
                <h2 className="mt-1 text-2xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                  {product.title}
                </h2>
                <div className="mt-2 flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star2 key={i} filled={product.rating >= i} />
                    ))}
                  </span>
                  <span className="text-sm text-zinc-500 font-medium">
                    {product.rating.toFixed(1)} · {product.reviewCount.toLocaleString()} reviews
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-2.5">
                  <span className="text-3xl font-extrabold text-zinc-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-lg text-zinc-400 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm text-zinc-600 leading-relaxed">{product.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-auto pt-6">
                  <p className="text-xs font-bold mb-2">
                    <span
                      className={cn(
                        "size-2 inline-block rounded-full mr-1.5",
                        product.inStock ? "bg-emerald-500" : "bg-rose-500"
                      )}
                    />
                    <span className={product.inStock ? "text-emerald-600" : "text-rose-500"}>
                      {product.inStock ? "In stock — ships in 24h" : "Currently out of stock"}
                    </span>
                  </p>
                  {product.inStock && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center rounded-xl border border-zinc-200">
                        <button
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          aria-label="Decrease quantity"
                          className="grid place-items-center size-10 text-zinc-600 hover:bg-zinc-100 rounded-l-xl"
                        >
                          <Minus size={14} weight="bold" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-zinc-900">{qty}</span>
                        <button
                          onClick={() => setQty((q) => Math.min(10, q + 1))}
                          aria-label="Increase quantity"
                          className="grid place-items-center size-10 text-zinc-600 hover:bg-zinc-100 rounded-r-xl"
                        >
                          <Plus size={14} weight="bold" />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          addToCart(product, qty);
                          closeQuickView();
                        }}
                        className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 active:scale-[0.99] transition-all"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        aria-label="Toggle wishlist"
                        className={cn(
                          "grid place-items-center size-11 rounded-xl border transition-colors",
                          wishlist.includes(product.id)
                            ? "border-rose-200 bg-rose-50 text-rose-500"
                            : "border-zinc-200 text-zinc-500 hover:border-rose-300 hover:text-rose-500"
                        )}
                      >
                        <Heart size={18} weight={wishlist.includes(product.id) ? "fill" : "regular"} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Star2({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", filled ? "text-amber-400" : "text-zinc-300")} fill="currentColor">
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

/* ---------------------------- Order confirmation -------------------------- */

function OrderConfirmationModal() {
  const { orderConfirmation, dismissConfirmation } = useStore();

  useEscape(!!orderConfirmation, dismissConfirmation);

  return (
    <AnimatePresence>
      {orderConfirmation && (
        <>
          <Overlay onClose={dismissConfirmation} />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md rounded-3xl bg-white shadow-2xl p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                className="mx-auto grid place-items-center size-20 rounded-full bg-emerald-100 text-emerald-600 mb-5"
              >
                <CheckCircle size={40} weight="fill" />
              </motion.div>
              <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                Order confirmed!
              </h2>
              <p className="text-sm text-zinc-500 mt-2">
                Thanks, {orderConfirmation.shippingName.split(" ")[0]}. A confirmation email is on
                its way to your inbox.
              </p>
              <div className="mt-6 rounded-2xl bg-zinc-50 border border-zinc-200 p-4">
                <div className="flex items-center justify-center gap-2 text-zinc-700">
                  <Package size={16} className="text-indigo-600" />
                  <span className="text-sm font-bold tracking-wide">
                    Order {orderConfirmation.orderId}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  {orderConfirmation.items.reduce((n, i) => n + i.quantity, 0)} items · Total{" "}
                  <span className="font-bold text-zinc-800">
                    ${orderConfirmation.summary.total.toFixed(2)}
                  </span>
                </p>
                <p className="text-xs text-zinc-500 mt-0.5 flex items-center justify-center gap-1">
                  <Truck size={12} className="text-indigo-500" />
                  Ships to {orderConfirmation.shippingName} in 2–4 business days
                </p>
              </div>
              <button
                onClick={dismissConfirmation}
                className="mt-6 w-full h-12 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 transition-colors"
              >
                Continue shopping
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------- Floating mobile cart bar ----------------------- */

function FloatingCartBar() {
  const { cartCount, summary, openCart } = useStore();
  return (
    <AnimatePresence>
      {cartCount > 0 && (
        <motion.button
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={openCart}
          className="fixed bottom-4 inset-x-4 z-40 md:hidden flex items-center justify-between rounded-2xl bg-zinc-900 text-white px-5 h-14 shadow-2xl shadow-zinc-900/40"
        >
          <span className="flex items-center gap-2 text-sm font-bold">
            <ShoppingCart size={18} className="text-indigo-300" />
            {cartCount} item{cartCount !== 1 && "s"}
          </span>
          <span className="flex items-center gap-1 text-sm font-extrabold">
            ${summary.total.toFixed(2)}
            <CaretRight size={15} className="text-indigo-300" />
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* --------------------------------- Exports -------------------------------- */

export function StoreOverlays() {
  return (
    <>
      <CartDrawer />
      <CheckoutModal />
      <AuthModal />
      <QuickViewModal />
      <OrderConfirmationModal />
      <FloatingCartBar />
    </>
  );
}

export { initials };