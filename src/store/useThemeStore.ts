import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('anu_theme') as 'light' | 'dark' | null;
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('anu_theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return { theme: next };
    });
  },
  setTheme: (theme) => {
    localStorage.setItem('anu_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
}));
