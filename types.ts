
export interface Sale {
  id?: string;
  itemName: string;
  quantity: number;
  price: number;
  total: number;
  paymentMethod: string;
  date: string; // ISO string format
  photo?: string; // Cloudinary URL
  cloudinaryId?: string; // Cloudinary public_id
  notes?: string;
  productId?: string;
  customerId?: string;
  salesperson?: string;
  discount?: number;
  paymentDetails?: string; 
  transactionId?: string; 
}

export interface Expense {
  id?: string;
  name: string;
  category: string;
  amount: number;
  date: string; // ISO string format
  note?: string;
  receiptPhoto?: string; // Cloudinary URL
  cloudinaryId?: string; // Cloudinary public_id
}

export interface Product {
  id?: string;
  name: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock: number;
  category?: string;
  photo?: string;
  cloudinaryId?: string;
}

export interface Customer {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  totalSpent: number;
  visitCount: number;
  lastVisit?: string;
  notes?: string;
}

export interface AdminSettings {
  secretKey: string;
  theme: 'light' | 'dark';
  currency: 'KSh' | 'USD' | 'EUR' | 'GBP';
  isPhotoSavingEnabled: boolean;
}
