import { create } from 'zustand';
import { getUserProfile, type UserProfileResponse } from '../api/user';

interface UserState {
    profile: UserProfileResponse | null;
    isLoading: boolean;
    // 프로필 정보가 있고 필수 값이 채워져 있는지 확인
    isProfileComplete: () => boolean;
    // 프로필 정보 가져오기 (이미 있으면 호출 안 함)
    fetchProfileIfNeeded: () => Promise<UserProfileResponse | null>;
    // 프로필 수동 업데이트 (마이페이지에서 수정 후 호출)
    setProfile: (profile: UserProfileResponse | null) => void;
    clearProfile: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
    profile: null,
    isLoading: false,

    isProfileComplete: () => {
        const { profile } = get();
        return !!(profile?.address && profile?.phone && profile?.name);
    },

    fetchProfileIfNeeded: async () => {
        const { profile, isLoading } = get();

        // 이미 로딩 중이거나 데이터가 있으면 기존 데이터 반환
        if (profile) return profile;
        if (isLoading) return null;

        set({ isLoading: true });
        try {
            const data = await getUserProfile();
            set({ profile: data, isLoading: false });
            return data;
        } catch (error) {
            set({ profile: null, isLoading: false });
            return null;
        }
    },

    setProfile: (profile) => set({ profile }),
    clearProfile: () => set({ profile: null }),
}));
