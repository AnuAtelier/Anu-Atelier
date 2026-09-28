import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Phone, Mail, MapPin, CheckCircle, ShieldCheck,
  Edit3, LogOut, LogIn, Package, Download, Trash2, XCircle, Sparkles
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { DEFAULT_SITE_SETTINGS } from '../constants';
import { orderService } from '../services/orderService';
import { Order } from '../types';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'privacy'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [fullName, setFullName] = useState(user?.fullName || 'Anushka Singh');
  const [email, setEmail] = useState(user?.email || DEFAULT_SITE_SETTINGS.supportEmail);
  const [phone, setPhone] = useState(user?.phone || DEFAULT_SITE_SETTINGS.whatsappNumber);

  const [flat, setFlat] = useState(() => {
    try {
      const saved = localStorage.getItem('anu_user_address');
      return saved ? JSON.parse(saved).flat : 'Flat 402, Royal Residency';
    } catch {
      return 'Flat 402, Royal Residency';
    }
  });
  const [area, setArea] = useState(() => {
    try {
      const saved = localStorage.getItem('anu_user_address');
      return saved ? JSON.parse(saved).area : 'Near Gomti Riverfront';
    } catch {
      return 'Near Gomti Riverfront';
    }
  });
  const [city, setCity] = useState(() => {
    try {
      const saved = localStorage.getItem('anu_user_address');
      return saved ? JSON.parse(saved).city : 'Lucknow';
    } catch {
      return 'Lucknow';
    }
  });
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('anu_user_address');
      return saved ? JSON.parse(saved).state : 'Uttar Pradesh';
    } catch {
      return 'Uttar Pradesh';
    }
  });
  const [pincode, setPincode] = useState(() => {
    try {
      const saved = localStorage.getItem('anu_user_address');
      return saved ? JSON.parse(saved).pincode : '226010';
    } catch {
      return '226010';
    }
  });

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Sync user details and check hash / query on mount
  useEffect(() => {
    if (window.location.hash === '#orders' || window.location.search.includes('tab=orders')) {
      setActiveTab('orders');
    }
    if (window.location.hash === '#edit' || window.location.search.includes('tab=edit')) {
      setActiveTab('profile');
      setIsEditing(true);
    }
  }, []);

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

  const handleStartEdit = () => {
    setActiveTab('profile');
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ fullName, email, phone });
    try {
      localStorage.setItem('anu_user_address', JSON.stringify({ flat, area, city, state, pincode }));
    } catch (err) {}
    setIsEditing(false);
    setSaveMessage('Profile & delivery address updated successfully! 🌸');
    setTimeout(() => setSaveMessage(null), 3500);
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
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-rose-500/10 backdrop-blur-md border border-pink-200/60 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center font-heading text-3xl font-bold flex-shrink-0 shadow-md">
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
              className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-semibold hover:from-pink-600 hover:to-rose-700 shadow-sm transition-all"
            >
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={handleStartEdit}
            className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
              activeTab === 'profile' && isEditing
                ? 'border-pink-500 bg-pink-500 text-white'
                : 'border-pink-200 bg-white/80 hover:bg-white text-gray-800'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert Banner */}
      {saveMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Options Navigation Tabs */}
      <div className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-2xl bg-white/70 backdrop-blur-md border border-pink-200/60 shadow-xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-pink-50/50'
          }`}
        >
          <User className="h-4 w-4" />
          <span>My Profile & Address</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-pink-50/50'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>My Orders</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'orders' ? 'bg-white text-pink-600' : 'bg-pink-100 text-pink-600'
          }`}>
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'privacy'
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-pink-50/50'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Privacy & Data Rights</span>
        </button>
      </div>

      {/* TAB 1: Profile & Delivery Address */}
      {activeTab === 'profile' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/90 via-sky-50/40 to-blue-50/20 backdrop-blur-md border border-sky-200/70 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-sky-600" />
              <h2 className="font-heading text-xl font-bold text-[var(--text-main)]">
                {isEditing ? 'Edit Profile & Delivery Address' : 'Profile & Delivery Address'}
              </h2>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Address</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200/60 text-xs text-sky-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-600 flex-shrink-0" />
                <span>Update your personal information and default shipping address below:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sky-200/60 bg-white/80 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sky-200/60 bg-white/80 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sky-200/60 bg-white/80 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                    PIN Code (6 digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-4 py-2.5 rounded-xl border border-sky-200/60 bg-white/80 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                    Flat, House no., Building *
                  </label>
                  <input
                    type="text"
                    required
                    value={flat}
                    onChange={(e) => setFlat(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sky-200/60 bg-white/80 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                    Area, Landmark *
                  </label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-sky-200/60 bg-white/80 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                    City, State *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-sky-200/60 bg-white/80 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                    />
                    <input
                      type="text"
                      required
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-sky-200/60 bg-white/80 text-[var(--text-main)] text-sm focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 rounded-full border border-sky-200 bg-white/80 text-xs font-semibold text-[var(--text-muted)] hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-sky-200/60 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-sky-600" />
                  <span className="text-sm font-semibold text-[var(--text-main)]">Contact Details</span>
                </div>
                <p className="text-sm font-medium text-[var(--text-main)]">{fullName}</p>
                <p className="text-xs text-[var(--text-muted)]">Email: {email}</p>
                <p className="text-xs text-[var(--text-muted)]">Phone: +91 {phone}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-sky-200/60 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-sky-600" />
                  <span className="text-sm font-semibold text-[var(--text-main)]">Default Delivery Address</span>
                </div>
                <p className="text-sm font-medium text-[var(--text-main)]">{fullName}</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {flat}, {area}, {city}, {state} - <span className="font-semibold text-stone-900">{pincode}</span>
                </p>
                <p className="text-xs text-[var(--text-muted)]">Mobile: +91 {phone}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Orders Section */}
      {activeTab === 'orders' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/90 via-rose-50/40 to-pink-50/30 backdrop-blur-md border border-pink-200/70 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="font-heading text-xl font-bold text-[var(--text-main)]">
                My Orders ({orders.length})
              </h2>
            </div>
          </div>

          {isLoadingOrders ? (
            <p className="text-xs text-[var(--text-muted)] py-8 text-center">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-pink-100/70 border border-pink-200 text-[var(--primary)] flex items-center justify-center mx-auto shadow-xs">
                <Package className="h-8 w-8 opacity-70" />
              </div>
              <p className="text-base font-semibold text-[var(--text-main)]">You haven't placed any orders yet.</p>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                Explore our authentic terracotta crafts, folk textiles, and handmade items to find your favorite piece.
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Explore Handcrafted Crafts
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-pink-200/60 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-pink-300 transition-all shadow-xs"
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
                        className="px-3 py-1.5 rounded-full text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all flex items-center gap-1 cursor-pointer"
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
      )}

      {/* TAB 3: Privacy & DPDPA 2023 Self-Service Controls */}
      {activeTab === 'privacy' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-orange-50/20 backdrop-blur-md border border-amber-200/70 shadow-sm space-y-4 animate-fade-in">
          <h3 className="font-heading text-base font-bold text-[var(--text-main)]">
            Account Privacy & Data Rights (DPDPA 2023)
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            You have full control over your personal data. You can download a portable copy or request permanent anonymization.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleExportData}
              className="px-4 py-2 rounded-full border border-amber-200 bg-white/80 hover:bg-white text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-amber-600" />
              <span>Download My Data (JSON)</span>
            </button>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Account & Anonymize Data</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
