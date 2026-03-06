import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserRole } from '@/features/auth/data/mockUsers';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; 

interface AuthUser {
    id: string;
    name: string;
    role: UserRole;
}

interface AuthState {
    user: AuthUser | null;
    loginAt: number | null;
    login: (user: AuthUser) => void;
    logout: () => void;
    isRole: (role: UserRole) => boolean;
    hasAnyRole: (...roles: UserRole[]) => boolean;
}

const sessionStorageWithTTL = {
    getItem: (name: string): string | null => {
        const raw = sessionStorage.getItem(name);
        if (!raw) return null;

        try {
            const parsed = JSON.parse(raw);
            const loginAt = parsed?.state?.loginAt;
            if (loginAt && Date.now() - loginAt > SESSION_TTL_MS) {
                
                sessionStorage.removeItem(name);
                return null;
            }
        } catch {
            
        }
        return raw;
    },
    setItem: (name: string, value: string) => {
        sessionStorage.setItem(name, value);
    },
    removeItem: (name: string) => {
        sessionStorage.removeItem(name);
    },
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            loginAt: null,

            login: (user) => set({ user, loginAt: Date.now() }),

            logout: () => {
                sessionStorage.removeItem("auth-storage");
                localStorage.removeItem("authToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("auth-storage");
                localStorage.removeItem("cash-box-session");
                set({ user: null, loginAt: null });
            },

            isRole: (role) => get().user?.role === role,

            hasAnyRole: (...roles) => {
                const currentRole = get().user?.role;
                return currentRole ? roles.includes(currentRole) : false;
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorageWithTTL),
        }
    )
);
