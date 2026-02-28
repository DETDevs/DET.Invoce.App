import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/features/auth/data/mockUsers';

interface AuthUser {
    id: string;
    name: string;
    role: UserRole;
}

interface AuthState {
    user: AuthUser | null;
    login: (user: AuthUser) => void;
    logout: () => void;
    isRole: (role: UserRole) => boolean;
    hasAnyRole: (...roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,

            login: (user) => set({ user }),

            logout: () => {
                localStorage.removeItem("authToken");
                localStorage.removeItem("auth-storage");
                localStorage.removeItem("cash-box-session");
                set({ user: null });
            },

            isRole: (role) => get().user?.role === role,

            hasAnyRole: (...roles) => {
                const currentRole = get().user?.role;
                return currentRole ? roles.includes(currentRole) : false;
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);

