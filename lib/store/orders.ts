"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './cart';
import { createClient } from '@/lib/supabase/client';

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
  loading: boolean;
  error: string | null;
  fetchOrders: (userId?: string) => Promise<void>;
  addOrder: (items: CartItem[], total: number, userId?: string) => Promise<void>;
  addToPendingPayment: (order: Order) => void;
  clearPendingPayments: () => void;
  updateOrderStatus: (orderId: string, status: 'pending' | 'completed') => Promise<void>;
  updatePaymentStatus: (orderId: string, status: 'unpaid' | 'paid') => Promise<void>;
  clearOrdersByTable: (tableNumber: number) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      pendingPaymentOrders: [],
      loading: false,
      error: null,

      fetchOrders: async (userId) => {
        set({ loading: true, error: null });
        try {
          const supabase = createClient();
          let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (userId) {
            query = query.eq('user_id', userId);
          }

          const { data: ordersData, error: ordersError } = await query;

          if (ordersError) throw ordersError;

          // Fetch order items for all orders
          const orderIds = (ordersData || []).map(o => o.id);
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

          if (itemsError) throw itemsError;

          // Convert snake_case to camelCase and structure the data
          const orders: Order[] = (ordersData || []).map(order => ({
            id: order.id.toString(),
            status: order.status as 'pending' | 'completed',
            paymentStatus: order.payment_status as 'unpaid' | 'paid',
            timestamp: order.created_at,
            total: order.total,
            tableNumber: order.table_number || 1,
            items: (itemsData || [])
              .filter(item => item.order_id === order.id)
              .map(item => ({
                id: item.menu_item_id.toString(),
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image || '',
              })),
          }));

          set({ orders, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      addOrder: async (items, total, userId) => {
        set({ loading: true, error: null });
        try {
          const supabase = createClient();

          // Insert order
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
              user_id: userId,
              status: 'pending',
              payment_status: 'unpaid',
              total,
              table_number: 1,
            })
            .select()
            .single();

          if (orderError) throw orderError;

          // Insert order items
          const orderItems = items.map(item => ({
            order_id: orderData.id,
            menu_item_id: parseInt(item.id),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) throw itemsError;

          // Create new order object for local state
          const newOrder: Order = {
            id: orderData.id.toString(),
            items,
            status: 'pending',
            paymentStatus: 'unpaid',
            timestamp: orderData.created_at,
            total,
            tableNumber: orderData.table_number || 1,
          };

          set((state) => ({
            orders: [newOrder, ...state.orders],
            loading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },
      addToPendingPayment: (order) =>
        set((state) => ({
          pendingPaymentOrders: [...state.pendingPaymentOrders, order],
        })),
      clearPendingPayments: () =>
        set(() => ({
          pendingPaymentOrders: [],
        })),
      updateOrderStatus: async (orderId, status) => {
        set({ loading: true, error: null });
        try {
          const supabase = createClient();
          const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', parseInt(orderId));

          if (error) throw error;

          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === orderId ? { ...order, status } : order
            ),
            pendingPaymentOrders: state.pendingPaymentOrders.map((order) =>
              order.id === orderId ? { ...order, status } : order
            ),
            loading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      updatePaymentStatus: async (orderId, status) => {
        set({ loading: true, error: null });
        try {
          const supabase = createClient();
          const { error } = await supabase
            .from('orders')
            .update({ payment_status: status })
            .eq('id', parseInt(orderId));

          if (error) throw error;

          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === orderId ? { ...order, paymentStatus: status } : order
            ),
            pendingPaymentOrders: state.pendingPaymentOrders.map((order) =>
              order.id === orderId ? { ...order, paymentStatus: status } : order
            ),
            loading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },
      clearOrdersByTable: (tableNumber) =>
        set((state) => ({
          orders: state.orders.filter(order => order.tableNumber !== tableNumber),
          pendingPaymentOrders: state.pendingPaymentOrders.filter(order => order.tableNumber !== tableNumber),
        })),
      clearOrders: () => set({ orders: [] }),
    }),
    {
      name: 'order-storage',
    }
  )
);

export type { OrderItem } from "@/types/orders";