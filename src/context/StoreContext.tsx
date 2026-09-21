import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { PRODUCTS } from "../data/products";
import type {
  AuthMode,
  CartItem,
  Category,
  CheckoutInfo,
  FilterState,
  OrderConfirmation,
  OrderSummary,
  Product,
  User,
} from "../types";

const TAX_RATE = 0.08;
const SHIPPING_FLAT = 12;
const FREE_SHIPPING_THRESHOLD = 150;
const PROMO_CODES: Record<string, number> = { LUMEN10: 0.1, WELCOME15: 0.15 };

interface StoreContextValue {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  user: User | null;
  cartOpen: boolean;
  authOpen: boolean;
  authMode: AuthMode;
  checkoutOpen: boolean;
  quickViewProduct: Product | null;
  query: string;
  filters: FilterState;
  orderConfirmation: OrderConfirmation | null;
  summary: OrderSummary;
  cartCount: number;
  wishlistCount: number;
  categories: Category[];
  openCart: () => void;
  closeCart: () => void;
  openAuth: (mode: AuthMode) => void;
  closeAuth: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  setQuery: (q: string) => void;
  setFilters: (patch: Partial<FilterState>) => void;
  resetFilters: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: "google" | "github") => Promise<void>;
  logout: () => void;
  applyPromo: (code: string) => boolean;
  placeOrder: (info: CheckoutInfo) => Promise<OrderConfirmation>;
  dismissConfirmation: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const DEFAULT_FILTERS: FilterState = {
  category: "All",
  searchQuery: "",
  minPrice: 0,
  maxPrice: 1000,
  sortBy: "featured",
  inStockOnly: false,
};

const AVATAR_COLORS = [
  "from-indigo-500 to-blue-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem("lumen-cart");
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("lumen-wishlist");
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("lumen-user");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [query, setQuery] = useState("");
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);
  const lastUserIndex = useRef(0);

  useEffect(() => {
    localStorage.setItem("lumen-cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("lumen-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);
  useEffect(() => {
    if (user) localStorage.setItem("lumen-user", JSON.stringify(user));
    else localStorage.removeItem("lumen-user");
  }, [user]);

  // Debounced search query -> filter state
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setFiltersState((prev) => ({ ...prev, searchQuery: query.trim() }));
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  const setFilters = useCallback((patch: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setQuery("");
    setFiltersState({ ...DEFAULT_FILTERS, searchQuery: "" });
  }, []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openAuth = useCallback((mode: AuthMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  const openCheckout = useCallback(() => {
    setCartOpen(false);
    setCheckoutOpen(true);
  }, []);
  const closeCheckout = useCallback(() => setCheckoutOpen(false), []);
  const openQuickView = useCallback((product: Product) => setQuickViewProduct(product), []);
  const closeQuickView = useCallback(() => setQuickViewProduct(null), []);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, 10) }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    toast.success(`${product.title} added to cart`);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.min(quantity, 10) } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const has = prev.includes(productId);
      toast.success(has ? "Removed from wishlist" : "Added to wishlist");
      return has ? prev.filter((id) => id !== productId) : [...prev, productId];
    });
  }, []);

  const summary = useMemo<OrderSummary>(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
    const beforeDiscount = subtotal + shipping;
    const discount = appliedPromo
      ? Math.round(beforeDiscount * (PROMO_CODES[appliedPromo] ?? 0) * 100) / 100
      : 0;
    const tax = Math.round((subtotal - discount * (subtotal / Math.max(beforeDiscount, 1))) * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + tax + shipping - discount) * 100) / 100;
    return { subtotal, tax, shipping, discount, total, promoCode: appliedPromo };
  }, [cart, appliedPromo]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const wishlistCount = wishlist.length;
  const categories = useMemo(
    () => [...new Set(PRODUCTS.map((p) => p.category))] as Category[],
    []
  );

  const applyPromo = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase();
      if (normalized in PROMO_CODES) {
        setAppliedPromo(normalized);
        toast.success(`Promo ${normalized} applied`);
        return true;
      }
      toast.error("Invalid promo code");
      return false;
    },
    []
  );

  const persistUser = useCallback((nextUser: User) => {
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      // Simulated async auth - swap for Supabase/Firebase later
      await new Promise((resolve) => setTimeout(resolve, 700));
      if (!email.includes("@") || password.length < 6) {
        throw new Error("Use a valid email and a password with 6+ characters");
      }
      const name = email
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      lastUserIndex.current = (lastUserIndex.current + 1) % AVATAR_COLORS.length;
      persistUser({
        name,
        email,
        avatar: AVATAR_COLORS[lastUserIndex.current],
        provider: "email",
      });
      toast.success(`Welcome back, ${name.split(" ")[0]}`);
    },
    [persistUser]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      if (!name.trim() || !email.includes("@") || password.length < 6) {
        throw new Error("Fill in your name, a valid email, and a 6+ character password");
      }
      lastUserIndex.current = (lastUserIndex.current + 1) % AVATAR_COLORS.length;
      persistUser({
        name: name.trim(),
        email,
        avatar: AVATAR_COLORS[lastUserIndex.current],
        provider: "email",
      });
      toast.success(`Account created. Welcome, ${name.split(" ")[0]}!`);
    },
    [persistUser]
  );

  const loginWithProvider = useCallback(
    async (provider: "google" | "github") => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const first = provider === "google" ? "Alex" : "Jordan";
      const last = provider === "google" ? "Morgan" : "Reed";
      lastUserIndex.current = (lastUserIndex.current + 1) % AVATAR_COLORS.length;
      persistUser({
        name: `${first} ${last}`,
        email: `${provider === "google" ? "alex.morgan" : "jordan.reed"}@${provider}.com`,
        avatar: AVATAR_COLORS[lastUserIndex.current],
        provider,
      });
      toast.success(`Signed in with ${provider === "google" ? "Google" : "GitHub"}`);
    },
    [persistUser]
  );

  const logout = useCallback(() => {
    setUser(null);
    toast.success("Signed out");
  }, []);

  const placeOrder = useCallback(
    async (info: CheckoutInfo) => {
      await new Promise((resolve) => setTimeout(resolve, 1400));
      if (cart.length === 0) throw new Error("Your cart is empty");
      const confirmation: OrderConfirmation = {
        orderId: `LUM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        placedAt: new Date().toISOString(),
        items: cart,
        summary,
        shippingName: info.fullName,
      };
      setOrderConfirmation(confirmation);
      setAppliedPromo(null);
      setCart([]);
      setCheckoutOpen(false);
      toast.success("Order placed. Thank you!");
      return confirmation;
    },
    [cart, summary]
  );

  const dismissConfirmation = useCallback(() => setOrderConfirmation(null), []);

  const value: StoreContextValue = {
    products: PRODUCTS,
    cart,
    wishlist,
    user,
    cartOpen,
    authOpen,
    authMode,
    checkoutOpen,
    quickViewProduct,
    query,
    filters,
    orderConfirmation,
    summary,
    cartCount,
    wishlistCount,
    categories,
    openCart,
    closeCart,
    openAuth,
    closeAuth,
    openCheckout,
    closeCheckout,
    openQuickView,
    closeQuickView,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleWishlist,
    setQuery,
    setFilters,
    resetFilters,
    login,
    signup,
    loginWithProvider,
    logout,
    applyPromo,
    placeOrder,
    dismissConfirmation,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export { initials };