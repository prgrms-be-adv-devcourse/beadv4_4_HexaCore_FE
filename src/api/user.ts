import axiosInstance from "./axios";

export const updateFcmToken = async (fcmToken: string) => {
    return axiosInstance.patch("/api/v1/users/me/fcm-token", { fcmToken });
};
