import axiosInstance from "./axios";


export interface UpdateNotificationSettingsRequest {
    bidStatusEnabled: boolean;
    productStatusEnabled: boolean;
    priceEnabled: boolean;
    settlementEnabled: boolean;
}

export interface NotificationSettingResponse extends UpdateNotificationSettingsRequest {
    userId: number;
}

export interface UpdateUserProfileRequest {
    nickname?: string;
    name?: string;
    phone?: string;
    address?: string;
}

export interface UserProfileResponse {
    userId: number;
    email: string;
    nickname: string;
    name: string;
    phone: string;
    address: string;
}

export const updateFcmToken = async (fcmToken: string) => {
    return axiosInstance.patch("/api/v1/users/me/fcm-token", { fcmToken });
};

export const updateNotificationSettings = async (request: UpdateNotificationSettingsRequest) => {
    return axiosInstance.patch("/api/v1/users/me/notifications/setting", request);
};

export const getNotificationSettings = async () => {
    const response = await axiosInstance.get<any>("/api/v1/users/me/notifications/setting");
    return response.data?.data || response.data;
};

/**
 * 내 프로필 정보 조회
 */
export const getUserProfile = async () => {
    const response = await axiosInstance.get<any>("/api/v1/users/me");
    return response.data?.data || response.data;
};

/**
 * 내 프로필 정보 수정
 */
export const updateUserProfile = async (request: UpdateUserProfileRequest) => {
    const response = await axiosInstance.patch<any>("/api/v1/users/me/profile", request);
    return response.data?.data || response.data;
};
