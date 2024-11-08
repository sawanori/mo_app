"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './cart';

export interface Order {
  id: string;
  items: CartItem[];
  status: 'pending' | 'completed';
  paymentStatus: 'unpaid' | 'paid';
  timestamp: string;
  total: number;
  tableNumber: number;
}

interface OrderStore {
  orders: Order[];
  pendingPaymentOrders: Order[];
  addOrder: (items: CartItem[], total: number) => void;
  addToPendingPayment: (order: Order) => void;
  clearPendingPayments: () => void;
  updateOrderStatus: (orderId: string, status: 'pending' | 'completed') => void;
  updatePaymentStatus: (orderId: string, status: 'unpaid' | 'paid') => void;
  clearOrdersByTable: (tableNumber: number) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      pendingPaymentOrders: [],
      addOrder: (items, total) => {
        const newOrder = {
          id: Math.random().toString(36).substring(7),
          items,
          status: 'pending' as const,
          paymentStatus: 'unpaid' as const,
          timestamp: new Date().toISOString(),
          total,
          tableNumber: 1,
        };
        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));
      },
      addToPendingPayment: (order) =>
        set((state) => ({
          pendingPaymentOrders: [...state.pendingPaymentOrders, order],
        })),
      clearPendingPayments: () =>
        set(() => ({
          pendingPaymentOrders: [],
        })),
      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ),
          pendingPaymentOrders: state.pendingPaymentOrders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ),
        })),
      updatePaymentStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, paymentStatus: status } : order
          ),
          pendingPaymentOrders: state.pendingPaymentOrders.map((order) =>
            order.id === orderId ? { ...order, paymentStatus: status } : order
          ),
        })),
      clearOrdersByTable: (tableNumber) =>
        set((state) => ({
          orders: state.orders.filter(order => order.tableNumber !== tableNumber),
          pendingPaymentOrders: state.pendingPaymentOrders.filter(order => order.tableNumber !== tableNumber),
        })),
    }),
    {
      name: 'order-storage',
    }
  )
);