export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  piecesPerCarton?: number;
  sku?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderDetails {
  customerName: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
}

export interface ConfirmedOrder {
  id: string;
  date: string; // ISO string format
  customerName: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
}