// Settlement 관련 타입 정의

export type SettlementStatus = 'PENDING' | 'IN_PROGRESS' | 'HOLD' | 'COMPLETED' | 'FAILED';

export type SettlementItemStatus = 'INCLUDED' | 'CANCELED' | 'REFUNDED' | 'NEGATIVE';

export type SettlementEventType = 'SETTLEMENT_PRODUCT_SALES_AMOUNT' | 'SETTLEMENT_PRODUCT_SALES_FEE';

export type ActorType = 'SYSTEM' | 'ADMIN' | 'BATCH';

// 정산 응답
export interface Settlement {
    settlementId: number;
    sellerId: number;
    sellerName: string;
    status: SettlementStatus;
    expectedAt: string;
    startAt: string;
    endAt: string;
    completedAt: string | null;
    totalSalesAmount: number;
    totalFeeAmount: number;
    totalNetAmount: number;
}

// 정산 항목 응답
export interface SettlementItem {
    settlementItemId: number;
    orderId: number;
    productId: number;
    payerId: number;
    payeeId: number;
    sellerName: string;
    eventType: SettlementEventType;
    status: SettlementItemStatus;
    amount: number;
    confirmedAt: string;
}

// 정산 로그 응답
export interface SettlementLog {
    logId: number;
    settlementId: number;
    previousStatus: SettlementStatus | null;
    newStatus: SettlementStatus;
    reason: string;
    actorType: ActorType;
    actorId: number;
    createdAt: string;
}

// 대시보드 응답
export interface SettlementDashboard {
    totalCount: number;
    countByStatus: Record<SettlementStatus, number>;
}

// 배치 실행 응답
export interface BatchExecutionResponse {
    jobId: number;
    status: string;
    targetMonth: string;
    startTime: string;
    endTime: string | null;
    processedCount: number;
}

// Spring Page 응답
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// 정산 목록 필터 (Admin)
export interface SettlementFilter {
    status?: SettlementStatus;
    sellerId?: number;
    startDate?: string;
    endDate?: string;
    page: number;
    size: number;
}

// 정산 항목 필터 (User)
export interface SettlementItemFilter {
    orderId?: number;
    productId?: number;
    status?: SettlementItemStatus;
    startDate?: string;
    endDate?: string;
    page: number;
    size: number;
}
