export type Category = "Electronics" | "Fashion" | "Home & Living" | "Accessories";

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  category: Category;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  inStock: boolean;
  tags: string[];
  isNew: boolean;
  isFeatured: boolean;
  createdAt: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

export interface FilterState {
  category: Category | "All";
  searchQuery: string;
  minPrice: number;
  maxPrice: number;
  sortBy: SortOption;
  inStockOnly: boolean;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  provider: "email" | "google" | "github";
}

export type AuthMode = "login" | "signup";

export interface OrderSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  promoCode: string | null;
}

export interface CheckoutInfo {
  fullName: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  paymentMethod: "card" | "applepay" | "paypal";
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
}

export interface OrderConfirmation {
  orderId: string;
  placedAt: string;
  items: CartItem[];
  summary: OrderSummary;
  shippingName: string;
}