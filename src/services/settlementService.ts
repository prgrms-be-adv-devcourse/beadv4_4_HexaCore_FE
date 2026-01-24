// Settlement API 서비스

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

const API_BASE_URL = import.meta.env.VITE_BACKEND_SETTLEMENT || 'http://localhost:8086';

// CommonResponse 타입
interface CommonResponse<T> {
    status: number;
    data: T;
    message?: string;
}

// API 요청 헬퍼
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('accessToken');

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result: CommonResponse<T> = await response.json();
    return result.data;
}

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
        return request<SettlementDashboard>('/api/v1/admin/settlements/dashboard');
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
        return request<PageResponse<Settlement>>(url);
    },

    // 정산 상세 조회
    getSettlement: async (settlementId: number): Promise<Settlement> => {
        return request<Settlement>(`/api/v1/admin/settlements/${settlementId}`);
    },

    // 특정 정산의 로그 조회
    getSettlementLogs: async (settlementId: number): Promise<SettlementLog[]> => {
        return request<SettlementLog[]>(`/api/v1/admin/settlements/${settlementId}/logs`);
    },

    // 전체 로그 조회
    getAllLogs: async (): Promise<SettlementLog[]> => {
        return request<SettlementLog[]>('/api/v1/admin/settlements/logs');
    },

    // 배치 실행
    runBatch: async (targetMonth: string): Promise<BatchExecutionResponse> => {
        const url = `${API_BASE_URL}/api/v1/admin/settlements/batch/run?targetMonth=${targetMonth}`;
        const token = localStorage.getItem('accessToken');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `배치 실행 실패: ${response.status}`);
        }

        const result: CommonResponse<BatchExecutionResponse> = await response.json();
        return result.data;
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
        return request<PageResponse<Settlement>>(url);
    },

    // 특정 사용자의 정산 목록 조회
    getSettlementsByUserId: async (userId: number): Promise<Settlement[]> => {
        return request<Settlement[]>(`/api/v1/settlements/users/${userId}`);
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
        return request<PageResponse<SettlementItem>>(url);
    },

    // 정산 항목 상세 조회
    getSettlementItem: async (settlementItemId: number): Promise<SettlementItem> => {
        return request<SettlementItem>(`/api/v1/settlements/items/${settlementItemId}`);
    },
};
