import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

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
        <p className="text-sm text-[var(--text-muted)] font-medium">Verifying admin credentials...</p>
      </div>
    );
  }

  // If not logged in or not an admin, immediately redirect to login with admin prompt
  if (!user || user.role !== 'admin') {
    return (
      <Navigate
        to="/login?from=admin"
        state={{ from: location, message: 'Please sign in with your Anushka admin account to access the Admin Panel.' }}
        replace
      />
    );
  }

  return <>{children}</>;
};
