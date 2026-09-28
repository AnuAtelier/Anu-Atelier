import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center space-y-6">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--secondary)] text-[var(--primary)] text-xs font-semibold">
        <Sparkles className="h-3.5 w-3.5" />
        <span>404 - Page Not Found</span>
      </div>

      <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[var(--text-main)]">
        Lost in the Atelier?
      </h1>

      <p className="text-sm text-[var(--text-muted)] leading-relaxed">
        The page you are looking for doesn't exist or may have been moved. Let's get you back to the collection.
      </p>

      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-semibold shadow-md transition-all"
        >
          <Home className="h-4 w-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};
