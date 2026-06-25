export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  joinDate: string;
}

export interface CartItem {
  id: number; // product id
  quantity: number;
}

export interface Order {
  id: number;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
  items: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  total: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  discountApplied?: number;
  couponCodeUsed?: string;
  postalCode?: string;
}

export interface Coupon {
  code: string;
  discount: number; // e.g. 15 for 15%
  isActive: boolean;
}

export interface MessagePlatform {
  id: string;
  name: string;
  icon: string; // e.g., 'MessageSquare', 'Phone', 'Send'
  value: string; // link or content
  bgColor: string; // Tailwind background color styling
  isActive: boolean;
}

