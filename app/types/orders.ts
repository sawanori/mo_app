export interface OrderItem {
    status: "pending" | "completed";
    id: number;
    name: string;
    quantity: number;
    price: number;
  }
  
  export interface Order {
    id: number;
    tableNumber: number;
    items: OrderItem[];
    status: "pending" | "completed";
    paymentStatus: "unpaid" | "paid";
    timestamp: string;
  }