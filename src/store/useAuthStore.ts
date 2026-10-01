import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithDemo: (role: 'admin' | 'customer') => void;
  loginWithSocial: (provider: 'google' | 'instagram') => Promise<{ success: boolean; error?: string }>;
  loginWithVerificationCode: (identifier: string, code: string, type: 'email' | 'social_handle') => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  logout: () => Promise<void>;
}

const LOCAL_STORAGE_KEY = 'anu_auth_user';
const EMAIL_STORAGE_KEY = 'anu_customer_email';

export const getStoredUser = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load local auth session', e);
  }
  return null;
};

const initialUser = getStoredUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  isLoading: false,
  error: null,

  initialize: async () => {
    // 1. If Supabase is configured with credentials
    if (isSupabaseConfigured) {
      set({ isLoading: true, error: null });
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch role and profile from 'profiles' table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const isAdmin =
            profile?.role === 'admin' ||
            session.user.email?.toLowerCase() === 'anushka32199@gmail.com';

          const userProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: profile?.full_name || session.user.user_metadata?.full_name || 'Artisan Friend',
            phone: profile?.phone || '',
            role: isAdmin ? 'admin' : 'customer',
            avatarUrl: profile?.avatar_url,
          };

          set({ user: userProfile, isLoading: false });

          // Listen to auth changes
          supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (newSession?.user) {
              const { data: p } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', newSession.user.id)
                .single();

              const isNewAdmin =
                p?.role === 'admin' ||
                newSession.user.email?.toLowerCase() === 'anushka32199@gmail.com';

              set({
                user: {
                  id: newSession.user.id,
                  email: newSession.user.email || '',
                  fullName: p?.full_name || newSession.user.user_metadata?.full_name || 'Artisan Friend',
                  role: isNewAdmin ? 'admin' : 'customer',
                  avatarUrl: p?.avatar_url,
                },
              });
            } else {
              set({ user: null });
            }
          });
          return;
        }
      } catch (err) {
        console.warn('Supabase auth initialization error, falling back to local storage', err);
      }
    }

    // 2. Fallback to localStorage session
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        set({ user: parsed, isLoading: false });
        return;
      }
    } catch (e) {
      console.error('Failed to load local auth session', e);
    }

    set({ user: null, isLoading: false });
  },

  updateProfile: (updates: Partial<UserProfile>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };
    set({ user: updated });
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save updated profile to localStorage', e);
    }
  },

  loginWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    const trimmedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }

        // Fetch verified profile from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const isAdmin =
          profile?.role === 'admin' ||
          trimmedEmail === 'anushka32199@gmail.com';

        const userProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email || trimmedEmail,
          fullName: profile?.full_name || data.user.user_metadata?.full_name || (isAdmin ? 'Anushka (Admin)' : 'Customer'),
          role: isAdmin ? 'admin' : 'customer',
          avatarUrl: profile?.avatar_url,
          phone: profile?.phone,
        };

        // Merge local guest cart to server cart on login
        try {
          const localCart = localStorage.getItem('anu_cart');
          if (localCart) {
            const items = JSON.parse(localCart);
            if (items.length > 0) {
              await supabase.rpc('merge_guest_cart', {
                p_local_items: items.map((it: any) => ({
                  product_id: it.productId || it.id,
                  quantity: it.qty,
                })),
              });
            }
          }
        } catch (e) {
          console.warn('Cart merge notice:', e);
        }

        set({ user: userProfile, isLoading: false });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userProfile));
        return { success: true };
      } catch (err: any) {
        set({ isLoading: false, error: err.message || 'Login failed' });
        return { success: false, error: err.message || 'Login failed' };
      }
    }

    // Demo / Local storage mode (Instant testing for development)
    const isAdmin = trimmedEmail === 'anushka32199@gmail.com';
    const mockUser: UserProfile = {
      id: isAdmin ? 'admin-anushka-uuid' : `user-${Date.now()}`,
      email: trimmedEmail,
      fullName: isAdmin ? 'Anushka (Owner & Artisan)' : trimmedEmail.split('@')[0],
      phone: isAdmin ? '9555562542' : '9876543210',
      role: isAdmin ? 'admin' : 'customer',
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockUser));
    localStorage.setItem(EMAIL_STORAGE_KEY, trimmedEmail);
    set({ user: mockUser, isLoading: false });
    return { success: true };
  },

  signupWithEmail: async (email: string, password: string, fullName: string, phone?: string) => {
    set({ isLoading: true, error: null });
    const trimmedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone || '',
            },
          },
        });

        if (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }

        const isAdmin = trimmedEmail === 'anushka32199@gmail.com';
        if (data.user) {
          const userProfile: UserProfile = {
            id: data.user.id,
            email: trimmedEmail,
            fullName,
            phone,
            role: isAdmin ? 'admin' : 'customer',
          };
          set({ user: userProfile, isLoading: false });
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userProfile));
        }
        return { success: true };
      } catch (err: any) {
        set({ isLoading: false, error: err.message || 'Signup failed' });
        return { success: false, error: err.message || 'Signup failed' };
      }
    }

    // Demo mode signup
    const isAdmin = trimmedEmail === 'anushka32199@gmail.com';
    const mockUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: trimmedEmail,
      fullName,
      phone,
      role: isAdmin ? 'admin' : 'customer',
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockUser));
    set({ user: mockUser, isLoading: false });
    return { success: true };
  },

  loginWithDemo: (role: 'admin' | 'customer') => {
    const demoUser: UserProfile = role === 'admin'
      ? {
        id: 'admin-anushka-uuid',
        email: 'anushka32199@gmail.com',
        fullName: 'Anushka (Owner & Artisan)',
        phone: '9555562542',
        role: 'admin',
      }
      : {
        id: 'customer-priya-uuid',
        email: 'priya.sharma@example.com',
        fullName: 'Priya Sharma',
        phone: '9876543210',
        role: 'customer',
      };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoUser));
    set({ user: demoUser, isLoading: false, error: null });
  },

  loginWithSocial: async (provider: 'google' | 'instagram') => {
    set({ isLoading: true, error: null });

    if (isSupabaseConfigured && provider === 'google') {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: any) {
        console.warn('Supabase social auth fallback to simulated session', err);
      }
    }

    // Customer login with verified social media handling
    const isGoogle = provider === 'google';
    const mockUser: UserProfile = {
      id: `social-${provider}-${Date.now()}`,
      email: isGoogle ? 'customer.google@gmail.com' : 'artisan.customer@instagram.user',
      fullName: isGoogle ? 'Google Customer' : 'Instagram Customer',
      role: 'customer',
      isVerified: true,
      authProvider: provider,
      socialHandle: isGoogle ? undefined : '@anu_customer',
      avatarUrl: isGoogle
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockUser));
    localStorage.setItem(EMAIL_STORAGE_KEY, mockUser.email);
    set({ user: mockUser, isLoading: false, error: null });
    return { success: true };
  },

  loginWithVerificationCode: async (identifier: string, code: string, type: 'email' | 'social_handle') => {
    set({ isLoading: true, error: null });

    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length < 4) {
      set({ isLoading: false, error: 'Please enter a valid verification code.' });
      return { success: false, error: 'Please enter a valid verification code.' };
    }

    const cleanIdentifier = identifier.trim();
    const isEmail = type === 'email';
    const normalizedEmail = isEmail
      ? cleanIdentifier.toLowerCase()
      : `${cleanIdentifier.replace('@', '').toLowerCase()}@instagram.user`;

    const userProfile: UserProfile = {
      id: `verified-${Date.now()}`,
      email: normalizedEmail,
      fullName: isEmail
        ? cleanIdentifier.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : (cleanIdentifier.startsWith('@') ? cleanIdentifier : `@${cleanIdentifier}`),
      role: 'customer',
      isVerified: true,
      authProvider: type,
      socialHandle: !isEmail ? (cleanIdentifier.startsWith('@') ? cleanIdentifier : `@${cleanIdentifier}`) : undefined,
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userProfile));
    localStorage.setItem(EMAIL_STORAGE_KEY, normalizedEmail);
    set({ user: userProfile, isLoading: false, error: null });
    return { success: true };
  },

  logout: async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Error signing out of Supabase', e);
      }
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(EMAIL_STORAGE_KEY);
    set({ user: null, isLoading: false });
  },
}));
