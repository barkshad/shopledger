
export interface Sale {
  id?: number;
  itemName: string;
  quantity: number;
  price: number;
  total: number;
  paymentMethod: string;
  date: string; // ISO string format
  photo?: string; // Base64 encoded image string
  notes?: string;
  // New fields
  productId?: number;
  customerId?: number;
  salesperson?: string;
  discount?: number; // Amount
  paymentDetails?: string; // JSON string for split payments
  transactionId?: string; // To group items in a cart
}

export interface Expense {
  id?: number;
  name: string;
  category: string;
  amount: number;
  date: string; // ISO string format
  note?: string;
  receiptPhoto?: string; // Base64 encoded image string
}

export interface Product {
  id?: number;
  name: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock: number;
  category?: string;
}

export interface Customer {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  totalSpent: number;
  visitCount: number;
  lastVisit?: string;
  notes?: string;
}
