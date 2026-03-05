import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

interface User {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    phone?: string;
    is_super_admin?: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    userType: 'admin' | 'public' | null;
    setAuth: (user: User, token: string, userType: 'admin' | 'public') => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            userType: null,
            setAuth: (user, token, userType) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('parvah_token', token);
                    localStorage.setItem('parvah_user_type', userType);

                    // Set cookies for server-side access (Middleware)
                    Cookies.set('parvah_token', token, { expires: 7 });
                    Cookies.set('parvah_user_type', userType, { expires: 7 });
                }
                set({ user, token, userType });
            },
            clearAuth: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('parvah_token');
                    localStorage.removeItem('parvah_user_type');

                    // Clear cookies
                    Cookies.remove('parvah_token');
                    Cookies.remove('parvah_user_type');
                }
                set({ user: null, token: null, userType: null });
            },
        }),
        {
            name: 'civictrack-auth',
        }
    )
);
