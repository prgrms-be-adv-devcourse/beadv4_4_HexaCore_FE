import axiosInstance from './axios';
import type { PageResponse } from '../types/product';
import type { BidSpamLogResponse } from '../types/admin';

export const getBidSpamLogs = async (page: number = 0, size: number = 20): Promise<PageResponse<BidSpamLogResponse>> => {
    const response = await axiosInstance.get('/api/v1/admin/detects/bid-spam-logs', {
        params: { page, size }
    });
    // Assuming CommonResponse<T> structure where response.data is { code, data, message, status }
    return response.data.data;
};
