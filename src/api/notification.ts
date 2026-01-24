import axiosInstance from './axios';

export interface NotificationResponse {
    id: string;
    title: string;
    body: string;
    deepLink: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationListResponse {
    code: string;
    data: {
        notificationResponses: NotificationResponse[];
        hasNext: boolean;
    };
    message: string;
    status: number;
}

export const getNotifications = async (page: number = 0, size: number = 5): Promise<NotificationListResponse> => {
    const response = await axiosInstance.get('/api/v1/notifications', {
        params: {
            page,
            size
        }
    });
    return response.data;
};
