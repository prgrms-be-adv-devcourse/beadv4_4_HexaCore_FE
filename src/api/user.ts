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

export const updateFcmToken = async (fcmToken: string) => {
    return axiosInstance.patch("/api/v1/users/me/fcm-token", { fcmToken });
};

export const updateNotificationSettings = async (request: UpdateNotificationSettingsRequest) => {
    return axiosInstance.patch("/api/v1/users/me/notifications/setting", request);
};

// CommonResponse 타입을 정의하거나 any 처리
export const getNotificationSettings = async () => {
    const response = await axiosInstance.get<any>("/api/v1/users/me/notifications/setting");
    return response.data?.data || response.data;
};
