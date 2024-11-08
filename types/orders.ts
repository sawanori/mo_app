export type OrderItemStatus = "pending" | "completed";
export type OrderStatus = "pending" | "completed";
export type PaymentStatus = "paid" | "unpaid";

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  status: OrderItemStatus;
}

export interface Order {
  id: number;
  tableNumber: number;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  timestamp: string;
} 