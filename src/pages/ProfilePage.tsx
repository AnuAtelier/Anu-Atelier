import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Phone, Mail, MapPin, CheckCircle, ShieldCheck,
  Edit3, LogOut, LogIn, Package, Clock, Download, Trash2, XCircle
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { DEFAULT_SITE_SETTINGS } from '../constants';
import { orderService } from '../services/orderService';
import { Order } from '../types';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || 'Anushka Singh');
  const [email, setEmail] = useState(user?.email || DEFAULT_SITE_SETTINGS.supportEmail);
  const [phone, setPhone] = useState(user?.phone || DEFAULT_SITE_SETTINGS.whatsappNumber);
  const [flat, setFlat] = useState('Flat 402, Royal Residency');
  const [area, setArea] = useState('Near Gomti Riverfront');
  const [city, setCity] = useState('Lucknow');
  const [state, setState] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('226010');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      if (user.phone) setPhone(user.phone);

      // Load user orders
      setIsLoadingOrders(true);
      orderService.fetchUserOrders(user.id).then((fetched) => {
        setOrders(fetched);
        setIsLoadingOrders(false);
      });
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    alert('Profile updated successfully! 🌸');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    const res = await orderService.cancelOrder(orderId, 'Cancelled by customer from profile');
    if (res.success) {
      alert('Order cancelled successfully.');
      if (user) {
        const refreshed = await orderService.fetchUserOrders(user.id);
        setOrders(refreshed);
      }
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    await orderService.exportUserData(user.id);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmStr = prompt('Type DELETE to permanently remove personal data (DPDPA 2023):');
    if (confirmStr === 'DELETE') {
      await orderService.deleteUserAccount(user.id);
      await logout();
      alert('Account personal data deleted successfully.');
      navigate('/');
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] max-w-md mx-auto px-4 py-16 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center mb-4 shadow-sm">
          <User className="h-8 w-8" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-[var(--text-main)] mb-2">
          Sign In to Your Account
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Access your orders, saved addresses, or artisan craft management
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            to="/login"
            className="flex-1 py-3 px-6 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </Link>
          <Link
            to="/register"
            className="flex-1 py-3 px-6 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-input)] text-[var(--text-main)] text-sm font-medium transition-all flex items-center justify-center"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin' || user.email === 'anushka32199@gmail.com';

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-8 space-y-8">
      {/* Profile Header Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[var(--secondary)]/40 via-[var(--bg-card)] to-[var(--bg-card)] border border-[var(--border-color)] flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-heading text-3xl font-bold flex-shrink-0 shadow-md">
          {fullName.charAt(0) || 'A'}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              {fullName}
            </h1>
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-100 text-[var(--primary-dark)] border border-pink-300 text-xs font-bold mx-auto sm:mx-0 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--primary)]" />
                <span>Store Owner & Admin</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-semibold mx-auto sm:mx-0">
                <CheckCircle className="h-3 w-3" />
                <span>Verified Buyer</span>
              </span>
            )}
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            {isAdmin ? 'Full administrative access to crafts & store orders' : 'Member of Anu Atelier handcrafted community'}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[var(--primary)]" />
              {email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[var(--primary)]" />
              +91 {phone}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
          {isAdmin && (
            <Link
              to="/admin"
              className="px-4 py-2 rounded-full bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-dark)] shadow-sm transition-all"
            >
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-input)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>{isEditing ? 'Cancel' : 'Edit'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Orders Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="font-heading text-xl font-bold text-[var(--text-main)]">
              My Orders ({orders.length})
            </h2>
          </div>
        </div>

        {isLoadingOrders ? (
          <p className="text-xs text-[var(--text-muted)] py-4 text-center">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-sm text-[var(--text-muted)]">You haven't placed any orders yet.</p>
            <Link
              to="/"
              className="inline-block px-5 py-2 rounded-full bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-dark)] transition-all"
            >
              Explore Handcrafted Crafts
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] flex flex-col sm:flex-row justify-between sm:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--primary)]">{order.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-700'
                          : order.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-700'
                          : order.status === 'Cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {order.items.map((i) => `${i.name} (x${i.qty})`).join(', ')}
                  </p>
                  <p className="text-xs font-semibold text-[var(--text-main)]">
                    Total: ₹{order.total} &bull; Mode: {order.paymentMethod}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(order.status === 'Placed' || order.status === 'Confirmed') && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center gap-1"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                  <Link
                    to={`/order-success/${order.id}`}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--primary)] bg-pink-50 hover:bg-pink-100 border border-pink-200 transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Details or Edit Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6">
        <h2 className="font-heading text-xl font-bold text-[var(--text-main)]">
          {isEditing ? 'Edit Profile & Delivery Address' : 'Saved Delivery Address'}
        </h2>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  PIN Code (6 digits)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  Flat, House no., Building
                </label>
                <input
                  type="text"
                  required
                  value={flat}
                  onChange={(e) => setFlat(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  Area, Landmark
                </label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  City, State
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 rounded-full border border-[var(--border-color)] text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-input)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-dark)]"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[var(--primary)]" />
              <span className="text-sm font-semibold text-[var(--text-main)]">Default Delivery Address</span>
            </div>
            <p className="text-sm text-[var(--text-main)]">{fullName}</p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {flat}, {area}, {city}, {state} - <span className="font-semibold">{pincode}</span>
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Mobile: +91 {phone}
            </p>
          </div>
        )}
      </div>

      {/* Privacy & DPDPA 2023 Self-Service Controls */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-4">
        <h3 className="font-heading text-base font-bold text-[var(--text-main)]">
          Account Privacy & Data Rights (DPDPA 2023)
        </h3>
        <p className="text-xs text-[var(--text-muted)]">
          You have full control over your personal data. You can download a portable copy or request permanent anonymization.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 transition-all"
          >
            <Download className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span>Download My Data (JSON)</span>
          </button>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Account & Anonymize Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
