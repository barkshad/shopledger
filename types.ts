
export interface Sale {
  id?: number;
  itemName: string;
  quantity: number;
  price: number;
  total: number;
  date: string; // ISO string format
  photo?: string; // Base64 encoded image string
}