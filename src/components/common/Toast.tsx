import React, { useEffect } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast, openDrawer } = useCartStore();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        clearToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-full bg-[var(--bg-card)] border border-[var(--primary)] text-[var(--text-main)] shadow-xl animate-bounce-in">
      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
      <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
      <button
        onClick={() => {
          clearToast();
          openDrawer();
        }}
        className="ml-1 text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
      >
        <span>View Cart</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
