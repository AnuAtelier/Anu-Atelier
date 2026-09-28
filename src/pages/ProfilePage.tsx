import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, CheckCircle, ShieldCheck, Edit3 } from 'lucide-react';
import { DEFAULT_SITE_SETTINGS } from '../constants';

export const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('Anushka Singh');
  const [email, setEmail] = useState(DEFAULT_SITE_SETTINGS.supportEmail);
  const [phone, setPhone] = useState(DEFAULT_SITE_SETTINGS.whatsappNumber);
  const [flat, setFlat] = useState('Flat 402, Royal Residency');
  const [area, setArea] = useState('Near Hanuman Temple, Gomti Nagar');
  const [city, setCity] = useState('Lucknow');
  const [state, setState] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('226010');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    alert('Profile updated successfully! 🌸');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-8 space-y-8">
      {/* Profile Header Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[var(--secondary)]/50 via-[var(--bg-card)] to-[var(--bg-card)] border border-[var(--border-color)] flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
        <div className="w-24 h-24 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-heading text-3xl font-bold flex-shrink-0 shadow-md">
          {fullName.charAt(0)}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              {fullName}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mx-auto sm:mx-0">
              <CheckCircle className="h-3 w-3" />
              <span>Verified Account</span>
            </span>
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            Member of Anu Atelier handcrafted community
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

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-input)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 shadow-sm"
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
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
    </div>
  );
};
