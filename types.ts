
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