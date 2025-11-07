export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  flavor: string;
  ingredients: string;
  nutrition_info: NutritionInfo;
  image_url: string;
  images?: ProductImages; // Multiple images for gallery
  stock: number;
  created_at: string;
  // Additional fields for detailed product page
  servingSize?: number; // in grams
  protein?: number; // in grams
  allergens?: string[];
  certifications?: string[]; // e.g., "Vegan", "Gluten-Free", "Non-GMO"
  benefits?: string[];
  usage_instructions?: string;
  storage_instructions?: string;
  manufacturer?: string;
  country_of_origin?: string;
  // Review aggregates
  average_rating?: number;
  review_count?: number;
}

export interface ProductImages {
  main: string;        // Main product image
  result?: string;     // How it looks when prepared
  package?: string;    // Package/container
  back?: string;       // Back of package with nutrition label
}

export interface NutritionInfo {
  servingSize: string;
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
  calcium?: string;
  iron?: string;
  vitaminD?: string;
  potassium?: string;
  saturatedFat?: string;
  transFat?: string;
  cholesterol?: string;
  [key: string]: string | number | undefined;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface PaymentDetails {
  method: 'stripe' | 'cash_on_delivery';
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  paidAt?: string;
}

export interface Order {
  id: string;
  customer_id?: string;
  customer_name: string;
  contact: string; // email or phone
  email?: string;
  phone?: string;
  products: CartItemWithProduct[];
  subtotal: number;
  discount_amount: number;
  discount_code?: string;
  shipping_cost: number;
  tax_amount: number;
  total: number;
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  payment_details: PaymentDetails;
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  fulfillment_status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  admin_notes?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

// Lightweight cart storage - only IDs and quantities
export interface CartItem {
  productId: string;            // Reference to product (fetch fresh data)
  quantity: number;
  selectedWeight: number;       // Weight in kg (1-5)
}

// Enriched cart item with full product data (for display)
export interface CartItemWithProduct extends CartItem {
  product: Product;
  appliedDiscount: number;      // Calculated discount percentage (0-0.20)
  pricePerKg: number;           // Current price from database
}

export interface DiscountCode {
  id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number; // Percentage (e.g., 10 for 10%) or fixed amount (e.g., 5.00 for £5)
  min_purchase_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  times_used: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: 'buy_click' | 'page_view' | 'add_to_cart' | 'product_view' | 'session_start' | 'session_end';
  product_id?: string;
  page: string;
  session_id?: string;
  duration_seconds?: number;
  scroll_depth_percentage?: number;
  device_type?: string;
  browser?: string;
  referrer?: string;
  user_agent?: string;
  metadata?: any;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  password_hash?: string;
  email_verified: boolean;
  last_login?: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  last_order_date?: string;
  first_order_date?: string;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  customer_id: string;
  product_id: string;
  added_at: string;
  notes?: string;
  product?: Product; // Populated when fetched with join
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  address_type: 'shipping' | 'billing' | 'both';
  is_default: boolean;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerSession {
  id: string;
  customer_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  last_activity: string;
  user_agent?: string;
  ip_address?: string;
}

export interface AuthResponse {
  success: boolean;
  customer?: Customer;
  token?: string;
  error?: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  previous_status?: string;
  new_status: string;
  changed_by: string;
  notes?: string;
  created_at: string;
}

export interface AdminActivityLog {
  id: string;
  admin_identifier: string;
  action: string;
  target_type: string;
  target_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
}

export interface ProductAnalyticsSummary {
  product_id: string;
  product_name: string;
  total_views: number;
  total_clicks: number;
  total_add_to_cart: number;
  avg_time_spent_seconds?: number;
  unique_sessions: number;
  click_through_rate: number;
}

export interface DailySalesSummary {
  sale_date: string;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  unique_customers: number;
}

export interface CustomerOrderSummary extends Customer {
  days_since_last_order?: number;
  pending_orders: number;
  completed_orders: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  user_email: string;
  rating: number;              // 1-5
  title: string;
  comment: string;
  photo_urls?: string[];       // Array of Supabase Storage URLs
  verified_purchase: boolean;
  purchase_date?: string;
  helpful_count: number;
  not_helpful_count: number;
  status: 'pending' | 'approved' | 'rejected';
  discount_code?: string;      // Generated after review submission
  created_at: string;
}

export interface ReviewStats {
  average_rating: number;
  review_count: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at'>;
        Update: Partial<Omit<Order, 'id' | 'created_at'>>;
      };
      analytics: {
        Row: AnalyticsEvent;
        Insert: Omit<AnalyticsEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<AnalyticsEvent, 'id' | 'created_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at'>;
        Update: Partial<Omit<Review, 'id' | 'created_at'>>;
      };
    };
  };
}
