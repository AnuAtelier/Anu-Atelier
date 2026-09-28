import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Plus,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Trash2,
  Edit3,
  Phone,
  MessageCircle,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { useAuthStore } from '../store/useAuthStore';
import { DEFAULT_SITE_SETTINGS } from '../constants';
import { Product, Order } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { products, deleteProduct } = useProductStore();

  const tabParam = searchParams.get('tab');
  const activeTab: 'crafts' | 'orders' | 'settings' =
    tabParam === 'orders' || tabParam === 'settings' ? tabParam : 'crafts';

  const setActiveTab = (tab: 'crafts' | 'orders' | 'settings') => {
    setSearchParams(tab === 'crafts' ? {} : { tab });
  };

  const [searchTerm, setSearchTerm] = useState('');

  // Local orders from storage
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('anu_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    // Default mock orders for Anushka's panel
    return [
      {
        id: 'ANU-849102',
        createdAt: Date.now() - 3600000 * 2,
        items: [
          {
            id: 'item-1',
            productId: 'p1111111-1111-1111-1111-111111111111',
            name: 'Hand-Carved Terracotta Table Vase',
            price: 599,
            image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80',
            qty: 1,
          },
        ],
        subtotal: 599,
        discount: 0,
        deliveryFee: 0,
        total: 599,
        shippingAddress: {
          id: 'addr-1',
          name: 'Priya Sharma',
          phone: '9876543210',
          pincode: '110001',
          houseFlat: 'A-42, Connaught Place',
          areaLandmark: 'Near Metro Gate 2',
          city: 'New Delhi',
          state: 'Delhi',
          type: 'Home',
          isDefault: true,
        },
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'Confirmed',
      },
      {
        id: 'ANU-739201',
        createdAt: Date.now() - 3600000 * 24,
        items: [
          {
            id: 'item-2',
            productId: 'p4444444-4444-4444-4444-444444444444',
            name: 'Chikankari Hand-Embroidered Cotton Kurti',
            price: 1299,
            image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
            qty: 1,
          },
        ],
        subtotal: 1299,
        discount: 100,
        deliveryFee: 0,
        total: 1199,
        shippingAddress: {
          id: 'addr-2',
          name: 'Meera Patel',
          phone: '9822334455',
          pincode: '400050',
          houseFlat: 'B-104, Hill View Apartments',
          areaLandmark: 'Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          type: 'Home',
          isDefault: true,
        },
        paymentMethod: 'upi',
        paymentStatus: 'completed',
        status: 'Shipped',
      },
    ];
  });

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const totalCraftsCount = products.length;
  const lowStockCount = products.filter((p) => p.stock < 5).length;

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    try {
      localStorage.setItem('anu_orders', JSON.stringify(updated));
    } catch (e) {}
  };

  const filteredCrafts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-pink-100 text-[var(--primary-dark)] text-xs font-bold border border-pink-300">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--primary)]" />
              <span>Anushka's Storefront Admin</span>
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-main)]">
            Artisan & Order Management
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Manage your authentic craft catalog, track customer orders, and update store settings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/add-craft"
            className="px-5 py-2.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs sm:text-sm font-semibold shadow-md flex items-center gap-2 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Craft</span>
          </Link>
          <Link
            to="/"
            target="_blank"
            className="px-4 py-2.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-input)] text-xs sm:text-sm font-medium text-[var(--text-main)] flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>View Store</span>
            <ExternalLink className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
            <span>Total Sales</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">All completed & placed orders</p>
        </div>

        {/* Orders */}
        <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
            <span>Customer Orders</span>
            <ShoppingBag className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <p className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
            {totalOrdersCount}
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">Active store purchases</p>
        </div>

        {/* Active Crafts */}
        <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
            <span>Crafts in Catalog</span>
            <Package className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
            {totalCraftsCount}
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">Published across 3 categories</p>
        </div>

        {/* Low Stock Alert */}
        <div className="p-5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
            <span>Low Stock Items</span>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
            {lowStockCount}
          </p>
          <p className="text-[11px] text-amber-600 font-medium">
            {lowStockCount > 0 ? 'Requires artisan replenishment' : 'Adequate inventory'}
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-[var(--border-color)] gap-8 text-base font-bold">
        <button
          onClick={() => setActiveTab('crafts')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'crafts'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Crafts Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'orders'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'settings'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Store Settings
        </button>
      </div>

      {/* TAB 1: CRAFTS CATALOG */}
      {activeTab === 'crafts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search crafts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--text-muted)]" />
            </div>

            <span className="text-xs text-[var(--text-muted)]">
              Showing {filteredCrafts.length} crafts
            </span>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-input)] border-b border-[var(--border-color)] text-gray-800 uppercase tracking-wider font-bold text-xs">
                <tr>
                  <th className="py-3.5 px-4">Craft</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Badge</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredCrafts.map((craft) => (
                  <tr key={craft.id} className="hover:bg-[var(--bg-input)]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={craft.image}
                          alt={craft.name}
                          className="w-10 h-12 object-cover rounded-lg flex-shrink-0 border border-[var(--border-color)]"
                        />
                        <div>
                          <p className="font-semibold text-[var(--text-main)]">{craft.name}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">{craft.subcategoryName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">{craft.categoryName}</td>
                    <td className="py-3 px-4 font-bold text-[var(--text-main)]">₹{craft.price}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          craft.stock <= 3
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {craft.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {craft.badge ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700">
                          {craft.badge}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/product/${craft.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                          title="View on Storefront"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove "${craft.name}" from catalog?`)) {
                              deleteProduct(craft.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          title="Delete Craft"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-input)] border-b border-[var(--border-color)] text-gray-800 uppercase tracking-wider font-bold text-xs">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--bg-input)]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[var(--primary)]">{order.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[var(--text-main)]">{order.shippingAddress.name}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">
                      {order.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-[var(--text-main)]">₹{order.total}</td>
                    <td className="py-3 px-4">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--primary-dark)]">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                        className="py-1 px-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-input)] text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`https://wa.me/91${order.shippingAddress.phone}?text=Hello%20${encodeURIComponent(
                          order.shippingAddress.name
                        )},%20this%20is%20Anushka%20from%20Anu%20Atelier%20regarding%20your%20order%20${order.id}.%20Status:%20${order.status}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold border border-emerald-200 transition-colors"
                      >
                        <MessageCircle className="h-3 w-3 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STORE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
            <Settings className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="font-heading text-lg font-bold text-[var(--text-main)]">
              Store Configuration
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[var(--text-main)] mb-1">
                Admin Email (Ownership ID)
              </label>
              <input
                type="email"
                disabled
                value={DEFAULT_SITE_SETTINGS.supportEmail}
                className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed"
              />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Designated admin email: <code>anushka32199@gmail.com</code>
              </p>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-main)] mb-1">
                WhatsApp Support & Notification Number
              </label>
              <input
                type="tel"
                disabled
                value={`+91 ${DEFAULT_SITE_SETTINGS.whatsappNumber}`}
                className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed"
              />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Dedicated WhatsApp support number: <code>9555562542</code>
              </p>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-main)] mb-1">
                Free Delivery Order Threshold (₹)
              </label>
              <input
                type="number"
                disabled
                value={DEFAULT_SITE_SETTINGS.freeDeliveryThreshold}
                className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed"
              />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                All customer orders above ₹100 receive automatic 100% Free Shipping.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-main)] mb-1">
                Announcement Banner Text
              </label>
              <input
                type="text"
                disabled
                value={DEFAULT_SITE_SETTINGS.announcementText}
                className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-muted)] cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
