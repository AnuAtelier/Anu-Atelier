/**
 * Anu Atelier - Admin & Store Management Service
 * Bridges Admin Dashboard & Inventory controls with Backend Admin RPCs
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order } from '../types';

export interface AdminAnalyticsSummary {
  totalRevenueRupees: number;
  totalOrders: number;
  avgOrderValueRupees: number;
  codRevenueRupees: number;
  prepaidRevenueRupees: number;
  codOrdersCount: number;
  prepaidOrdersCount: number;
  cancelledOrdersCount: number;
  deliveredOrdersCount: number;
}

export const adminService = {
  /**
   * Fetches paginated orders for admin dashboard
   */
  async fetchAdminOrders(
    status?: string,
    search?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ orders: any[]; totalCount: number }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('admin_list_orders', {
          p_status: status || null,
          p_search: search || null,
          p_limit: limit,
          p_offset: offset,
        });

        if (!error && data) {
          return {
            orders: (data.orders || []).map((o: any) => ({
              id: o.order_number || o.id,
              dbId: o.id,
              customerName: o.customer_name,
              customerEmail: o.customer_email,
              customerPhone: o.customer_phone,
              totalRupees: Math.round((o.total_paise || 0) / 100),
              status: o.status,
              paymentStatus: o.payment_status,
              paymentMethod: o.payment_method === 'cod' ? 'COD' : 'Online',
              itemsCount: o.items_count || 1,
              createdAt: o.created_at ? new Date(o.created_at).getTime() : Date.now(),
            })),
            totalCount: data.total_count || 0,
          };
        }
      } catch (e) {
        console.warn('Error fetching admin orders from Supabase:', e);
      }
    }

    // Local orders fallback
    const localOrders: Order[] = JSON.parse(localStorage.getItem('anu_orders') || '[]');
    let filtered = localOrders;
    if (status && status !== 'All') {
      filtered = filtered.filter((o) => o.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.shippingAddress.name.toLowerCase().includes(q) ||
          o.shippingAddress.phone.includes(q)
      );
    }

    return {
      orders: filtered.slice(offset, offset + limit).map((o) => ({
        id: o.id,
        dbId: o.id,
        customerName: o.shippingAddress.name,
        customerEmail: 'customer@anuatelier.com',
        customerPhone: o.shippingAddress.phone,
        totalRupees: o.total,
        status: o.status.toLowerCase(),
        paymentStatus: o.paymentStatus.toLowerCase(),
        paymentMethod: o.paymentMethod.includes('Cash') ? 'COD' : 'Online',
        itemsCount: o.items.length,
        createdAt: o.createdAt,
      })),
      totalCount: filtered.length,
    };
  },

  /**
   * Updates order status with backend ledger/invoice triggers
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const statusLower = newStatus.toLowerCase();

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.rpc('admin_update_order_status', {
          p_order_id: orderId,
          p_new_status: statusLower,
          p_reason: reason || 'Admin dashboard status update',
        });
        if (!error) return { success: true };
      } catch (e) {
        // Fallback to local
      }
    }

    // Local storage fallback update
    const orders: Order[] = JSON.parse(localStorage.getItem('anu_orders') || '[]');
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: (newStatus.charAt(0).toUpperCase() + newStatus.slice(1)) as any,
          }
        : o
    );
    localStorage.setItem('anu_orders', JSON.stringify(updated));
    return { success: true };
  },

  /**
   * Adjusts product stock in warehouse
   */
  async adjustStock(
    productId: string,
    delta: number,
    reason: string = 'restock'
  ): Promise<{ success: boolean; newStock?: number; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('admin_adjust_stock', {
          p_product_id: productId,
          p_delta: delta,
          p_reason: reason,
        });

        if (!error && data) {
          return { success: true, newStock: data.new_stock };
        }
      } catch (e) {}
    }

    return { success: true };
  },

  /**
   * Fetches real-time sales and revenue analytics
   */
  async fetchSalesAnalytics(): Promise<AdminAnalyticsSummary> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('get_sales_analytics');
        if (!error && data) {
          return {
            totalRevenueRupees: Math.round((data.total_revenue_paise || 0) / 100),
            totalOrders: data.total_orders || 0,
            avgOrderValueRupees: Math.round((data.average_order_value_paise || 0) / 100),
            codRevenueRupees: Math.round((data.cod_revenue_paise || 0) / 100),
            prepaidRevenueRupees: Math.round((data.prepaid_revenue_paise || 0) / 100),
            codOrdersCount: data.cod_orders_count || 0,
            prepaidOrdersCount: data.prepaid_orders_count || 0,
            cancelledOrdersCount: data.cancelled_orders_count || 0,
            deliveredOrdersCount: data.delivered_orders_count || 0,
          };
        }
      } catch (e) {}
    }

    // Local fallback analytics
    const orders: Order[] = JSON.parse(localStorage.getItem('anu_orders') || '[]');
    const validOrders = orders.filter((o) => o.status !== 'Cancelled');
    const totalRev = validOrders.reduce((sum, o) => sum + o.total, 0);
    const codOrders = validOrders.filter((o) => o.paymentMethod.includes('Cash'));
    const prepaidOrders = validOrders.filter((o) => !o.paymentMethod.includes('Cash'));

    return {
      totalRevenueRupees: totalRev,
      totalOrders: validOrders.length,
      avgOrderValueRupees: validOrders.length > 0 ? Math.round(totalRev / validOrders.length) : 0,
      codRevenueRupees: codOrders.reduce((sum, o) => sum + o.total, 0),
      prepaidRevenueRupees: prepaidOrders.reduce((sum, o) => sum + o.total, 0),
      codOrdersCount: codOrders.length,
      prepaidOrdersCount: prepaidOrders.length,
      cancelledOrdersCount: orders.filter((o) => o.status === 'Cancelled').length,
      deliveredOrdersCount: orders.filter((o) => o.status === 'Delivered').length,
    };
  },
};
