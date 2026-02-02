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

// 날짜를 ISO DateTime 형식으로 변환 (백엔드 LocalDateTime 형식)
function toISODateTime(dateString?: string): string | undefined {
    if (!dateString) return undefined;
    // YYYY-MM-DD -> YYYY-MM-DDTHH:mm:ss
    return `${dateString}T00:00:00`;
}

function toISODateTimeEnd(dateString?: string): string | undefined {
    if (!dateString) return undefined;
    // YYYY-MM-DD -> YYYY-MM-DDTHH:mm:ss (하루 끝)
    return `${dateString}T23:59:59`;
}

// ============ 관리자용 API ============
// Base URL: /api/v1/admin/settlements
// 권한: ADMIN 전용

export const adminSettlementService = {
    // 대시보드 조회
    // GET /api/v1/admin/settlements/dashboard
    getDashboard: async (): Promise<SettlementDashboard> => {
        const response = await axiosInstance.get('/api/v1/admin/settlements/dashboard');
        return response.data.data;
    },

    // 정산 목록 조회 (필터, 페이지네이션)
    // GET /api/v1/admin/settlements
    // Query: status, sellerId, startDate (ISO DateTime), endDate (ISO DateTime), page, size
    getSettlements: async (filter: SettlementFilter): Promise<PageResponse<Settlement>> => {
        const url = buildUrl('/api/v1/admin/settlements', {
            status: filter.status,
            sellerId: filter.sellerId,
            startDate: toISODateTime(filter.startDate),
            endDate: toISODateTimeEnd(filter.endDate),
            page: filter.page,
            size: filter.size,
        });
        const response = await axiosInstance.get(url);
        return response.data.data;
    },

    // 정산 상세 조회
    // GET /api/v1/admin/settlements/{settlementId}
    getSettlement: async (settlementId: number): Promise<Settlement> => {
        const response = await axiosInstance.get(`/api/v1/admin/settlements/${settlementId}`);
        return response.data.data;
    },

    // 특정 정산의 로그 조회
    // GET /api/v1/admin/settlements/{settlementId}/logs
    getSettlementLogs: async (settlementId: number): Promise<SettlementLog[]> => {
        const response = await axiosInstance.get(`/api/v1/admin/settlements/${settlementId}/logs`);
        return response.data.data;
    },

    // 전체 로그 조회
    // GET /api/v1/admin/settlements/logs
    getAllLogs: async (): Promise<SettlementLog[]> => {
        const response = await axiosInstance.get('/api/v1/admin/settlements/logs');
        return response.data.data;
    },

    // 일간 배치 실행
    // POST /api/v1/admin/settlements/batch/daily?targetDate=yyyy-MM-dd
    runDailyBatch: async (targetDate: string): Promise<BatchExecutionResponse> => {
        const response = await axiosInstance.post(`/api/v1/admin/settlements/batch/daily?targetDate=${targetDate}`);
        return response.data.data;
    },

    // 월간 배치 실행
    // POST /api/v1/admin/settlements/batch/monthly?targetMonth=yyyy-MM
    runMonthlyBatch: async (targetMonth: string): Promise<BatchExecutionResponse> => {
        const response = await axiosInstance.post(`/api/v1/admin/settlements/batch/monthly?targetMonth=${targetMonth}`);
        return response.data.data;
    },

    // 배치 실행 내역 조회
    // GET /api/v1/admin/settlements/batch/history?jobType=daily|monthly&count=20
    getBatchHistory: async (jobType?: string, count: number = 20): Promise<BatchExecutionResponse[]> => {
        const url = buildUrl('/api/v1/admin/settlements/batch/history', {
            jobType,
            count,
        });
        const response = await axiosInstance.get(url);
        return response.data.data;
    },

    // Admin용 정산 항목 조회 (날짜 범위)
    // GET /api/v1/settlements/items - Admin도 이 API를 사용하지만 본인 항목만 조회됨
    // 참고: Admin이 모든 판매자의 항목을 조회하려면 백엔드에 별도 API 필요
    getSettlementItemsByDateRange: async (
        startDate?: string,
        endDate?: string,
        page = 0,
        size = 20
    ): Promise<PageResponse<SettlementItem>> => {
        const url = buildUrl('/api/v1/settlements/items', {
            startDate: toISODateTime(startDate),
            endDate: toISODateTimeEnd(endDate),
            page,
            size,
        });
        const response = await axiosInstance.get(url);
        return response.data.data;
    },
};

// ============ 판매자용 API ============
// Base URL: /api/v1/settlements
// 권한: 로그인한 판매자 (자신의 정산만 조회 가능)

export const settlementService = {
    // 정산 목록 조회 (날짜 범위)
    // GET /api/v1/settlements
    // Query: startDate (ISO DateTime), endDate (ISO DateTime), page, size
    getSettlements: async (startDate?: string, endDate?: string, page = 0, size = 10): Promise<PageResponse<Settlement>> => {
        const url = buildUrl('/api/v1/settlements', {
            startDate: toISODateTime(startDate),
            endDate: toISODateTimeEnd(endDate),
            page,
            size,
        });
        const response = await axiosInstance.get(url);
        return response.data.data;
    },

    // 정산 항목 목록 조회
    // GET /api/v1/settlements/items
    // Query: orderId, productId, status, startDate (ISO DateTime), endDate (ISO DateTime), page, size
    getSettlementItems: async (filter: SettlementItemFilter): Promise<PageResponse<SettlementItem>> => {
        const url = buildUrl('/api/v1/settlements/items', {
            orderId: filter.orderId,
            productId: filter.productId,
            status: filter.status,
            startDate: toISODateTime(filter.startDate),
            endDate: toISODateTimeEnd(filter.endDate),
            page: filter.page,
            size: filter.size,
        });
        const response = await axiosInstance.get(url);
        return response.data.data;
    },

    // 정산 항목 상세 조회
    // GET /api/v1/settlements/items/{settlementItemId}
    getSettlementItem: async (settlementItemId: number): Promise<SettlementItem> => {
        const response = await axiosInstance.get(`/api/v1/settlements/items/${settlementItemId}`);
        return response.data.data;
    },
};
