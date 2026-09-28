import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { ShieldAlert } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
        <p className="text-sm text-neutral-500 font-medium">Verifying admin credentials...</p>
      </div>
    );
  }

  // Not logged in -> send to login with return path
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but not an admin -> show friendly access denied banner with option to switch to Anushka's account
  if (user.role !== 'admin') {
    return (
      <div className="min-h-[70vh] max-w-lg mx-auto px-4 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-[var(--text-main)] mb-2">
          Admin Access Required
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
          The seller/craft management panel is reserved for store owner Anushka (<code>anushka32199@gmail.com</code>). Currently logged in as <span className="font-medium text-[var(--text-main)]">{user.email}</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => {
              useAuthStore.getState().loginWithDemo('admin');
            }}
            className="flex-1 py-3 px-4 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-semibold shadow-md transition-all"
          >
            Switch to Anushka (Admin)
          </button>
          <a
            href="/"
            className="flex-1 py-3 px-4 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] text-sm font-medium hover:bg-[var(--bg-input)] transition-all flex items-center justify-center"
          >
            Return to Store
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
