// Settlement API 서비스
import axiosInstance from '../api/axios';
import type {
    Settlement,
    SettlementItem,
    SettlementLog,
    SettlementDashboard,
    BatchExecutionResponse,
    PageResponse,
    SettlementFilter,
    SettlementItemFilter,
} from '../types/settlement';

// URL에 쿼리 파라미터 추가 헬퍼
function buildUrl(endpoint: string, params?: Record<string, string | number | undefined>): string {
    if (!params) return endpoint;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `${endpoint}?${queryString}` : endpoint;
}

// ============ 관리자용 API ============

export const adminSettlementService = {
    // 대시보드 조회
    getDashboard: async (): Promise<SettlementDashboard> => {
        const response = await axiosInstance.get('/api/v1/admin/settlements/dashboard');
        return response.data.data;
    },

    // 정산 목록 조회 (필터, 페이지네이션)
    getSettlements: async (filter: SettlementFilter): Promise<PageResponse<Settlement>> => {
        const url = buildUrl('/api/v1/admin/settlements', {
            status: filter.status,
            sellerId: filter.sellerId,
            startDate: filter.startDate,
            endDate: filter.endDate,
            page: filter.page,
            size: filter.size,
        });
        const response = await axiosInstance.get(url);
        return response.data.data;
    },

    // 정산 상세 조회
    getSettlement: async (settlementId: number): Promise<Settlement> => {
        const response = await axiosInstance.get(`/api/v1/admin/settlements/${settlementId}`);
        return response.data.data;
    },

    // 특정 정산의 로그 조회
    getSettlementLogs: async (settlementId: number): Promise<SettlementLog[]> => {
        const response = await axiosInstance.get(`/api/v1/admin/settlements/${settlementId}/logs`);
        return response.data.data;
    },

    // 전체 로그 조회
    getAllLogs: async (): Promise<SettlementLog[]> => {
        const response = await axiosInstance.get('/api/v1/admin/settlements/logs');
        return response.data.data;
    },

    // 배치 실행
    runBatch: async (targetMonth: string): Promise<BatchExecutionResponse> => {
        const response = await axiosInstance.post(`/api/v1/admin/settlements/batch/run?targetMonth=${targetMonth}`);
        return response.data.data;
    },
};

// ============ 판매자용 API ============

export const settlementService = {
    // 정산 목록 조회 (날짜 범위)
    getSettlements: async (startDate?: string, endDate?: string, page = 0, size = 10): Promise<PageResponse<Settlement>> => {
        const url = buildUrl('/api/v1/settlements', {
            startDate,
            endDate,
            page,
            size,
        });
        const response = await axiosInstance.get(url);
        return response.data.data;
    },

    // 특정 사용자의 정산 목록 조회
    getSettlementsByUserId: async (userId: number): Promise<Settlement[]> => {
        const response = await axiosInstance.get(`/api/v1/settlements/users/${userId}`);
        return response.data.data;
    },

    // 정산 항목 목록 조회
    getSettlementItems: async (filter: SettlementItemFilter): Promise<PageResponse<SettlementItem>> => {
        const url = buildUrl('/api/v1/settlements/items', {
            orderId: filter.orderId,
            productId: filter.productId,
            status: filter.status,
            startDate: filter.startDate,
            endDate: filter.endDate,
            page: filter.page,
            size: filter.size,
        });
        const response = await axiosInstance.get(url);
        return response.data.data;
    },

    // 정산 항목 상세 조회
    getSettlementItem: async (settlementItemId: number): Promise<SettlementItem> => {
        const response = await axiosInstance.get(`/api/v1/settlements/items/${settlementItemId}`);
        return response.data.data;
    },
};
