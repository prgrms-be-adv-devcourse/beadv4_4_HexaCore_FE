import { create } from 'zustand';

interface AuthState {
    accessToken: string | null;
    user: any | null; // JWT claims
    isAuthenticated: boolean;
    setAuth: (token: string, claims: any) => void;
    clearAuth: () => void;
}

const getUserFromStorage = () => {
    try {
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('role');

        if (userId && role) {
            return { userId, role };
        }
        return null;
    } catch (e) {
        return null;
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: localStorage.getItem('accessToken'),
    user: getUserFromStorage(),
    isAuthenticated: !!localStorage.getItem('accessToken'),

    setAuth: (token, claims) => {
        // claims에서 필요한 정보만 추출 (sub -> userId, role -> role)
        const userInfo = {
            userId: claims.sub,
            role: claims.role
        };

        localStorage.setItem('accessToken', token);
        // 개별 키로 분리 저장
        localStorage.setItem('userId', userInfo.userId);
        localStorage.setItem('role', userInfo.role);

        set({ accessToken: token, user: userInfo, isAuthenticated: true });
    },

    clearAuth: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        set({ accessToken: null, user: null, isAuthenticated: false });
    },
}));
