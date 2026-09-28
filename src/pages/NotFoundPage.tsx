import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto my-20 p-8 sm:p-10 text-center space-y-6 rounded-3xl bg-gradient-to-br from-white/95 via-pink-50/35 to-purple-50/25 backdrop-blur-xl border border-pink-200/70 shadow-xl">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-[var(--primary-dark)] text-xs font-semibold border border-pink-200">
        <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
        <span>404 - Page Not Found</span>
      </div>

      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text-main)]">
        Lost in the Atelier?
      </h1>

      <p className="text-sm text-[var(--text-muted)] leading-relaxed">
        The page you are looking for doesn't exist or may have been moved. Let's get you back to the collection.
      </p>

      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-600 to-pink-600 hover:from-pink-600 hover:to-rose-700 text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
        >
          <Home className="h-4 w-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};
