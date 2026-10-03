export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  subcategories: {
    id: string;
    name: string;
  }[];
}

export interface ProductVariant {
  id: string;
  colorName: string;
  colorHex: string;
  image?: string;
  size?: string;
  price?: number;
  stock?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  image: string;
  images?: string[];
  stock: number;
  status: 'published' | 'draft' | 'archived';
  rating?: number;
  reviewsCount?: number;
  soldCount?: number;
  badge?: 'New' | 'Bestseller' | 'Handmade' | 'Limited' | null;
  variants?: ProductVariant[];
  highlights?: string[];
  specs?: Record<string, string>;
  createdAt: number;
  updatedAt?: number;
}

export interface CartItem {
  id: string; // product id or product_variant id
  productId: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  qty: number;
  stock: number;
  categoryName?: string;
  selectedVariant?: {
    color?: string;
    size?: string;
  };
}

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  houseFlat: string;
  areaLandmark: string;
  city: string;
  state: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  phoneVerified?: boolean;
  avatarUrl?: string;
  role: 'customer' | 'admin';
  socialHandle?: string;
  isVerified?: boolean;
  authProvider?: 'email' | 'google' | 'instagram' | 'social_handle';
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

export interface Order {
  id: string;
  createdAt: number;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  shippingAddress: UserAddress;
  paymentMethod: 'cod' | 'upi' | 'card' | 'netbanking' | 'wallet';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'demo';
  status: 'Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for delivery' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  trackingCarrier?: string;
  upiUtr?: string;
}

export interface SiteSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  supportEmail: string;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  announcementText?: string;
  codAvailable: boolean;
  replacementDays: number;
}

export interface ReelStory {
  id: string;
  type: 'artisan' | 'customer';
  title: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  location?: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  caption: string;
  likesCount: number;
  viewsCount: string;
  badge?: string;
  craftTag?: {
    productId?: string;
    productSlug?: string;
    productName: string;
    productPrice: number;
    productImage: string;
  };
  customerReview?: {
    rating: number;
    city: string;
    comment: string;
  };
  musicTrack?: {
    title: string;
    artist: string;
    audioUrl: string;
  };
  createdAt: number;
}
