import React, { useState, useEffect, useCallback } from 'react';
import {
    DollarSign, Clock, CheckCircle, AlertCircle, Pause, Play,
    FileText, RefreshCw, Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
} from 'lucide-react';
import { adminSettlementService, settlementService } from '../../services/settlementService';
import type {
    Settlement, SettlementItem, SettlementLog, SettlementDashboard, BatchExecutionResponse,
    SettlementStatus, PageResponse, SettlementFilter,
} from '../../types/settlement';

// 상태별 라벨
const STATUS_LABELS: Record<SettlementStatus, string> = {
    PENDING: '대기중',
    IN_PROGRESS: '진행중',
    HOLD: '보류',
    COMPLETED: '완료',
    FAILED: '실패',
};

// 상태별 스타일
const STATUS_STYLES: Record<SettlementStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    HOLD: 'bg-orange-100 text-orange-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
};

// 상태별 아이콘
const STATUS_ICONS: Record<SettlementStatus, React.ReactNode> = {
    PENDING: <Clock className="w-4 h-4" />,
    IN_PROGRESS: <Play className="w-4 h-4" />,
    HOLD: <Pause className="w-4 h-4" />,
    COMPLETED: <CheckCircle className="w-4 h-4" />,
    FAILED: <AlertCircle className="w-4 h-4" />,
};

// 정산 항목 상태별 라벨
const ITEM_STATUS_LABELS: Record<string, string> = {
    INCLUDED: '포함',
    CANCELED: '취소',
    REFUNDED: '환불',
    NEGATIVE: '마이너스',
};

// 정산 항목 상태별 스타일
const ITEM_STATUS_STYLES: Record<string, string> = {
    INCLUDED: 'bg-green-100 text-green-800',
    CANCELED: 'bg-gray-100 text-gray-800',
    REFUNDED: 'bg-orange-100 text-orange-800',
    NEGATIVE: 'bg-red-100 text-red-800',
};

// 정산 이벤트 타입 라벨
const EVENT_TYPE_LABELS: Record<string, string> = {
    SETTLEMENT_PRODUCT_SALES_AMOUNT: '상품 판매',
    SETTLEMENT_PRODUCT_SALES_FEE: '판매 수수료',
};

// 금액 포맷
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
};

// 날짜 포맷
const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const AdminSettlement = () => {
    // 탭 상태
    const [activeTab, setActiveTab] = useState<'dashboard' | 'settlements' | 'items' | 'logs' | 'batch'>('dashboard');

    // 대시보드 상태
    const [dashboard, setDashboard] = useState<SettlementDashboard | null>(null);
    const [dashboardLoading, setDashboardLoading] = useState(false);

    // 정산 목록 상태
    const [settlements, setSettlements] = useState<PageResponse<Settlement> | null>(null);
    const [settlementsLoading, setSettlementsLoading] = useState(false);
    const [filter, setFilter] = useState<SettlementFilter>({ page: 0, size: 10 });

    // 정산 상세 (토글)
    const [expandedSettlementId, setExpandedSettlementId] = useState<number | null>(null);
    const [settlementItems, setSettlementItems] = useState<SettlementItem[]>([]);
    const [settlementLogs, setSettlementLogs] = useState<SettlementLog[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);

    // 로그 상태
    const [allLogs, setAllLogs] = useState<SettlementLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // 배치 상태 - 일간
    const [dailyBatchDate, setDailyBatchDate] = useState(() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0]; // yyyy-MM-dd
    });
    const [dailyBatchLoading, setDailyBatchLoading] = useState(false);

    // 배치 상태 - 월간
    const [monthlyBatchMonth, setMonthlyBatchMonth] = useState(() => {
        const now = new Date();
        now.setMonth(now.getMonth() - 1); // 전월
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [monthlyBatchLoading, setMonthlyBatchLoading] = useState(false);

    // 배치 결과 & 내역
    const [batchResult, setBatchResult] = useState<BatchExecutionResponse | null>(null);
    const [batchHistory, setBatchHistory] = useState<BatchExecutionResponse[]>([]);
    const [batchHistoryLoading, setBatchHistoryLoading] = useState(false);
    const [batchHistoryFilter, setBatchHistoryFilter] = useState<string>(''); // '', 'daily', 'monthly'

    // 정산 항목 탭 상태
    const [allItems, setAllItems] = useState<PageResponse<SettlementItem> | null>(null);
    const [allItemsLoading, setAllItemsLoading] = useState(false);
    const [itemsStartDate, setItemsStartDate] = useState(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return firstDay.toISOString().split('T')[0];
    });
    const [itemsEndDate, setItemsEndDate] = useState(() => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    });
    const [itemsPage, setItemsPage] = useState(0);
    const ITEMS_SIZE = 20;

    // 배치 에러 상태
    const [batchError, setBatchError] = useState<{ code: string; message: string } | null>(null);

    // 대시보드 로드
    const loadDashboard = useCallback(async () => {
        setDashboardLoading(true);
        try {
            const data = await adminSettlementService.getDashboard();
            setDashboard(data);
        } catch (error) {
            console.error('대시보드 로드 실패:', error);
        } finally {
            setDashboardLoading(false);
        }
    }, []);

    // 정산 목록 로드
    const loadSettlements = useCallback(async () => {
        setSettlementsLoading(true);
        try {
            const data = await adminSettlementService.getSettlements(filter);
            setSettlements(data);
        } catch (error) {
            console.error('정산 목록 로드 실패:', error);
        } finally {
            setSettlementsLoading(false);
        }
    }, [filter]);

    // 날짜 문자열에서 yyyy-MM-dd 형식 추출
    const extractDateString = (dateTime: string): string => {
        return dateTime.split('T')[0];
    };

    // 정산 상세 토글
    const toggleSettlementDetail = useCallback(async (settlementId: number, settlement?: Settlement) => {
        // 이미 열려있으면 닫기
        if (expandedSettlementId === settlementId) {
            setExpandedSettlementId(null);
            return;
        }

        setExpandedSettlementId(settlementId);
        setDetailLoading(true);
        setSettlementItems([]);
        setSettlementLogs([]);

        try {
            // 정산 기간으로 항목 조회
            const targetSettlement = settlement || settlements?.content.find(s => s.settlementId === settlementId);

            const [itemsResponse, logs] = await Promise.all([
                targetSettlement
                    ? settlementService.getSettlementItems({
                        startDate: extractDateString(targetSettlement.startAt),
                        endDate: extractDateString(targetSettlement.endAt),
                        page: 0,
                        size: 100,
                    })
                    : Promise.resolve({ content: [] as SettlementItem[], totalElements: 0, totalPages: 0, size: 100, number: 0, first: true, last: true, empty: true }),
                adminSettlementService.getSettlementLogs(settlementId),
            ]);
            setSettlementItems(itemsResponse.content);
            setSettlementLogs(logs);
        } catch (error) {
            console.error('정산 상세 로드 실패:', error);
            setSettlementItems([]);
            setSettlementLogs([]);
        } finally {
            setDetailLoading(false);
        }
    }, [expandedSettlementId, settlements]);

    // 전체 로그 로드
    const loadAllLogs = useCallback(async () => {
        setLogsLoading(true);
        try {
            const data = await adminSettlementService.getAllLogs();
            setAllLogs(data);
        } catch (error) {
            console.error('로그 로드 실패:', error);
        } finally {
            setLogsLoading(false);
        }
    }, []);

    // 에러 정보 추출 헬퍼
    const extractError = (error: unknown): { code: string; message: string } => {
        if (error && typeof error === 'object') {
            const err = error as { response?: { data?: { code?: string; message?: string } }; message?: string };
            if (err.response?.data) {
                return {
                    code: err.response.data.code || 'UNKNOWN_ERROR',
                    message: err.response.data.message || '알 수 없는 오류가 발생했습니다.',
                };
            }
            if (err.message) {
                return { code: 'UNKNOWN_ERROR', message: err.message };
            }
        }
        return { code: 'UNKNOWN_ERROR', message: '알 수 없는 오류가 발생했습니다.' };
    };

    // 일간 배치 실행
    const runDailyBatch = async () => {
        if (!dailyBatchDate) return;
        setDailyBatchLoading(true);
        setBatchResult(null);
        setBatchError(null);
        try {
            const result = await adminSettlementService.runDailyBatch(dailyBatchDate);
            setBatchResult(result);
            loadBatchHistory();
        } catch (error) {
            console.error('일간 배치 실행 실패:', error);
            setBatchError(extractError(error));
        } finally {
            setDailyBatchLoading(false);
        }
    };

    // 월간 배치 실행
    const runMonthlyBatch = async () => {
        if (!monthlyBatchMonth) return;
        setMonthlyBatchLoading(true);
        setBatchResult(null);
        setBatchError(null);
        try {
            const result = await adminSettlementService.runMonthlyBatch(monthlyBatchMonth);
            setBatchResult(result);
            loadDashboard();
            loadSettlements();
            loadBatchHistory();
            // 배치 완료 후 정산 항목 새로고침
            if (activeTab === 'items') {
                loadAllItems(0);
            }
        } catch (error) {
            console.error('월간 배치 실행 실패:', error);
            setBatchError(extractError(error));
        } finally {
            setMonthlyBatchLoading(false);
        }
    };

    // 배치 내역 조회
    const loadBatchHistory = useCallback(async () => {
        setBatchHistoryLoading(true);
        try {
            const data = await adminSettlementService.getBatchHistory(
                batchHistoryFilter || undefined,
                20
            );
            setBatchHistory(data);
        } catch (error) {
            console.error('배치 내역 로드 실패:', error);
            setBatchHistory([]);
        } finally {
            setBatchHistoryLoading(false);
        }
    }, [batchHistoryFilter]);

    // 정산 항목 로드 (날짜 범위)
    const loadAllItems = useCallback(async (page: number = 0) => {
        setAllItemsLoading(true);
        try {
            const data = await adminSettlementService.getSettlementItemsByDateRange(
                itemsStartDate,
                itemsEndDate,
                page,
                ITEMS_SIZE
            );
            setAllItems(data);
            setItemsPage(page);
        } catch (error) {
            console.error('정산 항목 로드 실패:', error);
            setAllItems(null);
        } finally {
            setAllItemsLoading(false);
        }
    }, [itemsStartDate, itemsEndDate]);

    // 최근 정산 목록 (대시보드용)
    const [recentSettlements, setRecentSettlements] = useState<PageResponse<Settlement> | null>(null);
    const [recentLoading, setRecentLoading] = useState(false);
    const [recentPage, setRecentPage] = useState(0);
    const RECENT_SIZE = 5;

    // 최근 정산 로드
    const loadRecentSettlements = useCallback(async (page: number = 0) => {
        setRecentLoading(true);
        try {
            const data = await adminSettlementService.getSettlements({ page, size: RECENT_SIZE });
            setRecentSettlements(data);
        } catch (error) {
            console.error('최근 정산 로드 실패:', error);
        } finally {
            setRecentLoading(false);
        }
    }, []);

    // 초기 로드
    useEffect(() => {
        loadDashboard();
        loadRecentSettlements(0);
    }, [loadDashboard, loadRecentSettlements]);

    // 최근 정산 페이지 변경
    useEffect(() => {
        loadRecentSettlements(recentPage);
    }, [recentPage, loadRecentSettlements]);

    useEffect(() => {
        if (activeTab === 'settlements') loadSettlements();
        if (activeTab === 'logs') loadAllLogs();
        if (activeTab === 'batch') loadBatchHistory();
        if (activeTab === 'items') loadAllItems(0);
    }, [activeTab, loadSettlements, loadAllLogs, loadBatchHistory, loadAllItems]);

    // 배치 내역 필터 변경 시 로드
    useEffect(() => {
        if (activeTab === 'batch') {
            loadBatchHistory();
        }
    }, [batchHistoryFilter]);

    // 페이지 변경
    const handlePageChange = (newPage: number) => {
        setFilter(prev => ({ ...prev, page: newPage }));
    };

    // 필터 변경
    const handleFilterChange = (key: keyof SettlementFilter, value: string | number | undefined) => {
        setFilter(prev => ({ ...prev, [key]: value, page: 0 }));
    };

    // 필터 초기화
    const resetFilter = () => {
        setFilter({ page: 0, size: 10 });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-xl font-bold text-gray-900">정산 관리</h1>
                        <button
                            onClick={() => {
                                loadDashboard();
                                loadRecentSettlements(recentPage);
                                if (activeTab === 'settlements') loadSettlements();
                                if (activeTab === 'logs') loadAllLogs();
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            새로고침
                        </button>
                    </div>
                </div>
            </div>

            {/* 탭 */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex gap-8">
                        {[
                            { id: 'dashboard', label: '대시보드' },
                            { id: 'settlements', label: '정산 목록' },
                            { id: 'items', label: '정산 항목' },
                            { id: 'logs', label: '변경 이력' },
                            { id: 'batch', label: '배치 실행' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`py-4 border-b-2 text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-black text-black'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* 컨텐츠 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 대시보드 탭 */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {dashboardLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black" />
                            </div>
                        ) : dashboard ? (
                            <>
                                {/* 전체 건수 */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gray-100 rounded-lg">
                                            <FileText className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">전체 정산</p>
                                            <p className="text-2xl font-bold text-gray-900">{dashboard.totalCount.toLocaleString()}건</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 상태별 카드 */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {(['PENDING', 'IN_PROGRESS', 'HOLD', 'COMPLETED', 'FAILED'] as SettlementStatus[]).map(status => (
                                        <div
                                            key={status}
                                            className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => {
                                                setFilter({ page: 0, size: 10, status });
                                                setActiveTab('settlements');
                                            }}
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`p-2 rounded-lg ${STATUS_STYLES[status]}`}>
                                                    {STATUS_ICONS[status]}
                                                </span>
                                                <span className="text-sm font-medium text-gray-600">{STATUS_LABELS[status]}</span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {(dashboard.countByStatus[status] || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* 최근 정산 목록 */}
                                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                    <div className="flex items-center justify-between p-4 border-b">
                                        <h3 className="font-semibold text-gray-900">최근 정산</h3>
                                        <button
                                            onClick={() => setActiveTab('settlements')}
                                            className="text-sm text-gray-500 hover:text-black transition-colors"
                                        >
                                            전체 보기 →
                                        </button>
                                    </div>
                                    {recentLoading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-black" />
                                        </div>
                                    ) : recentSettlements && recentSettlements.content.length > 0 ? (
                                        <>
                                            <div className="divide-y">
                                                {recentSettlements.content.map(settlement => (
                                                    <div
                                                        key={settlement.settlementId}
                                                        onClick={() => {
                                                            setActiveTab('settlements');
                                                            setFilter({ page: 0, size: 10 });
                                                            toggleSettlementDetail(settlement.settlementId, settlement);
                                                        }}
                                                        className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                                <DollarSign className="w-5 h-5 text-gray-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{settlement.sellerName}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {formatDate(settlement.startAt)} ~ {formatDate(settlement.endAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="font-semibold text-gray-900">{formatCurrency(settlement.totalNetAmount)}</p>
                                                                <p className="text-xs text-gray-500">정산액</p>
                                                            </div>
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[settlement.status]}`}>
                                                                {STATUS_ICONS[settlement.status]}
                                                                {STATUS_LABELS[settlement.status]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* 페이지네이션 */}
                                            {recentSettlements.totalPages > 1 && (
                                                <div className="px-4 py-3 border-t flex items-center justify-between bg-gray-50">
                                                    <p className="text-xs text-gray-500">
                                                        총 {recentSettlements.totalElements.toLocaleString()}건
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setRecentPage(prev => prev - 1)}
                                                            disabled={recentSettlements.first}
                                                            className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <ChevronLeft className="w-4 h-4" />
                                                        </button>
                                                        <span className="text-xs text-gray-600">
                                                            {recentPage + 1} / {recentSettlements.totalPages}
                                                        </span>
                                                        <button
                                                            onClick={() => setRecentPage(prev => prev + 1)}
                                                            disabled={recentSettlements.last}
                                                            className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">정산 데이터가 없습니다.</div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-500">데이터를 불러올 수 없습니다.</div>
                        )}
                    </div>
                )}

                {/* 정산 목록 탭 */}
                {activeTab === 'settlements' && (
                    <div className="space-y-6">
                        {/* 필터 */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Search className="w-4 h-4 text-gray-400" />
                                    <select
                                        value={filter.status || ''}
                                        onChange={e => handleFilterChange('status', e.target.value || undefined)}
                                        className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                                    >
                                        <option value="">전체 상태</option>
                                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <input
                                    type="number"
                                    placeholder="판매자 ID"
                                    value={filter.sellerId || ''}
                                    onChange={e => handleFilterChange('sellerId', e.target.value ? Number(e.target.value) : undefined)}
                                    className="border rounded-lg px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                                <input
                                    type="date"
                                    value={filter.startDate || ''}
                                    onChange={e => handleFilterChange('startDate', e.target.value || undefined)}
                                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                                <span className="text-gray-400">~</span>
                                <input
                                    type="date"
                                    value={filter.endDate || ''}
                                    onChange={e => handleFilterChange('endDate', e.target.value || undefined)}
                                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                                <button
                                    onClick={resetFilter}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    초기화
                                </button>
                            </div>
                        </div>

                        {/* 테이블 */}
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            {settlementsLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black" />
                                </div>
                            ) : settlements && settlements.content.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10"></th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">판매자</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">정산 기간</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">매출액</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">수수료</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">정산액</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {settlements.content.map(settlement => (
                                                    <React.Fragment key={settlement.settlementId}>
                                                        <tr
                                                            onClick={() => toggleSettlementDetail(settlement.settlementId, settlement)}
                                                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${expandedSettlementId === settlement.settlementId ? 'bg-gray-50' : ''}`}
                                                        >
                                                            <td className="px-4 py-4 text-sm text-gray-500">
                                                                {expandedSettlementId === settlement.settlementId ? (
                                                                    <ChevronUp className="w-4 h-4" />
                                                                ) : (
                                                                    <ChevronDown className="w-4 h-4" />
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4 text-sm text-gray-900">{settlement.settlementId}</td>
                                                            <td className="px-4 py-4 text-sm">
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{settlement.sellerName}</p>
                                                                    <p className="text-gray-500">ID: {settlement.sellerId}</p>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[settlement.status]}`}>
                                                                    {STATUS_ICONS[settlement.status]}
                                                                    {STATUS_LABELS[settlement.status]}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4 text-sm text-gray-500">
                                                                {formatDate(settlement.startAt)} ~ {formatDate(settlement.endAt)}
                                                            </td>
                                                            <td className="px-4 py-4 text-sm text-right text-gray-900">
                                                                {formatCurrency(settlement.totalSalesAmount)}
                                                            </td>
                                                            <td className="px-4 py-4 text-sm text-right text-red-600">
                                                                -{formatCurrency(settlement.totalFeeAmount)}
                                                            </td>
                                                            <td className="px-4 py-4 text-sm text-right font-semibold text-gray-900">
                                                                {formatCurrency(settlement.totalNetAmount)}
                                                            </td>
                                                        </tr>
                                                        {/* 정산 항목 펼침 영역 */}
                                                        {expandedSettlementId === settlement.settlementId && (
                                                            <tr>
                                                                <td colSpan={8} className="px-4 py-4 bg-gray-50 border-t">
                                                                    <div className="space-y-4">
                                                                        {/* 정산 항목 */}
                                                                        <div>
                                                                            <h4 className="font-medium text-gray-900 mb-2">정산 항목</h4>
                                                                            {detailLoading ? (
                                                                                <div className="flex justify-center py-4">
                                                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-black" />
                                                                                </div>
                                                                            ) : settlementItems.length > 0 ? (
                                                                                <div className="border rounded-lg overflow-hidden bg-white">
                                                                                    <table className="w-full text-sm">
                                                                                        <thead className="bg-gray-100 border-b">
                                                                                            <tr>
                                                                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">주문ID</th>
                                                                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">상품ID</th>
                                                                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">유형</th>
                                                                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">상태</th>
                                                                                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">금액</th>
                                                                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">확정일</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody className="divide-y">
                                                                                            {settlementItems.map(item => (
                                                                                                <tr key={item.settlementItemId} className="hover:bg-gray-50">
                                                                                                    <td className="px-3 py-2 text-gray-900">{item.orderId}</td>
                                                                                                    <td className="px-3 py-2 text-gray-900">{item.productId}</td>
                                                                                                    <td className="px-3 py-2 text-gray-600">
                                                                                                        {EVENT_TYPE_LABELS[item.eventType] || item.eventType}
                                                                                                    </td>
                                                                                                    <td className="px-3 py-2">
                                                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ITEM_STATUS_STYLES[item.status] || 'bg-gray-100 text-gray-800'}`}>
                                                                                                            {ITEM_STATUS_LABELS[item.status] || item.status}
                                                                                                        </span>
                                                                                                    </td>
                                                                                                    <td className={`px-3 py-2 text-right font-medium ${item.eventType === 'SETTLEMENT_PRODUCT_SALES_FEE' ? 'text-red-600' : 'text-gray-900'}`}>
                                                                                                        {item.eventType === 'SETTLEMENT_PRODUCT_SALES_FEE' ? '-' : ''}{formatCurrency(Math.abs(item.amount))}
                                                                                                    </td>
                                                                                                    <td className="px-3 py-2 text-gray-500">{formatDate(item.confirmedAt)}</td>
                                                                                                </tr>
                                                                                            ))}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-center py-4 text-gray-500 bg-white rounded-lg border">정산 항목이 없습니다.</p>
                                                                            )}
                                                                        </div>

                                                                        {/* 상태 변경 이력 */}
                                                                        <div>
                                                                            <h4 className="font-medium text-gray-900 mb-2">상태 변경 이력</h4>
                                                                            {detailLoading ? (
                                                                                <div className="flex justify-center py-4">
                                                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-black" />
                                                                                </div>
                                                                            ) : settlementLogs.length > 0 ? (
                                                                                <div className="space-y-2">
                                                                                    {settlementLogs.map(log => (
                                                                                        <div key={log.logId} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                                                                                            <div className="flex-1">
                                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                                    {log.previousStatus && (
                                                                                                        <>
                                                                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[log.previousStatus]}`}>
                                                                                                                {STATUS_LABELS[log.previousStatus]}
                                                                                                            </span>
                                                                                                            <span className="text-gray-400">→</span>
                                                                                                        </>
                                                                                                    )}
                                                                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[log.newStatus]}`}>
                                                                                                        {STATUS_LABELS[log.newStatus]}
                                                                                                    </span>
                                                                                                </div>
                                                                                                {log.reason && <p className="text-sm text-gray-600">{log.reason}</p>}
                                                                                            </div>
                                                                                            <div className="text-right text-xs text-gray-500">
                                                                                                <p>{log.actorType}</p>
                                                                                                <p>{formatDateTime(log.createdAt)}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-center py-4 text-gray-500 bg-white rounded-lg border">변경 이력이 없습니다.</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* 페이지네이션 */}
                                    <div className="px-6 py-4 border-t flex items-center justify-between">
                                        <p className="text-sm text-gray-500">
                                            총 {settlements.totalElements.toLocaleString()}건 중 {filter.page * filter.size + 1}-{Math.min((filter.page + 1) * filter.size, settlements.totalElements)}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(filter.page - 1)}
                                                disabled={settlements.first}
                                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <span className="text-sm text-gray-600">
                                                {filter.page + 1} / {settlements.totalPages}
                                            </span>
                                            <button
                                                onClick={() => handlePageChange(filter.page + 1)}
                                                disabled={settlements.last}
                                                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 text-gray-500">정산 데이터가 없습니다.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* 정산 항목 탭 */}
                {activeTab === 'items' && (
                    <div className="space-y-6">
                        {/* 날짜 범위 선택 */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <div className="flex flex-wrap items-center gap-4">
                                <label className="text-sm font-medium text-gray-700">조회 기간</label>
                                <input
                                    type="date"
                                    value={itemsStartDate}
                                    onChange={e => setItemsStartDate(e.target.value)}
                                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                                <span className="text-gray-400">~</span>
                                <input
                                    type="date"
                                    value={itemsEndDate}
                                    onChange={e => setItemsEndDate(e.target.value)}
                                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                                <button
                                    onClick={() => loadAllItems(0)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <Search className="w-4 h-4" />
                                    조회
                                </button>
                            </div>
                        </div>

                        {/* 정산 항목 목록 */}
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            {allItemsLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black" />
                                </div>
                            ) : allItems && allItems.content.length > 0 ? (
                                <>
                                    <div className="p-4 border-b bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-gray-900">정산 항목</h3>
                                            <span className="text-sm text-gray-500">
                                                총 {allItems.totalElements.toLocaleString()}건
                                            </span>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">항목 ID</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">주문 ID</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상품 ID</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">판매자</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">금액</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">확정일</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {allItems.content.map(item => (
                                                    <tr key={item.settlementItemId} className="hover:bg-gray-50">
                                                        <td className="px-4 py-4 text-sm text-gray-900">{item.settlementItemId}</td>
                                                        <td className="px-4 py-4 text-sm text-gray-900">{item.orderId}</td>
                                                        <td className="px-4 py-4 text-sm text-gray-900">{item.productId}</td>
                                                        <td className="px-4 py-4 text-sm text-gray-900">{item.sellerName}</td>
                                                        <td className="px-4 py-4 text-sm">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                item.eventType === 'SETTLEMENT_PRODUCT_SALES_FEE'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                {EVENT_TYPE_LABELS[item.eventType] || item.eventType}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ITEM_STATUS_STYLES[item.status] || 'bg-gray-100 text-gray-800'}`}>
                                                                {ITEM_STATUS_LABELS[item.status] || item.status}
                                                            </span>
                                                        </td>
                                                        <td className={`px-4 py-4 text-sm text-right font-medium ${
                                                            item.eventType === 'SETTLEMENT_PRODUCT_SALES_FEE' ? 'text-red-600' : 'text-gray-900'
                                                        }`}>
                                                            {item.eventType === 'SETTLEMENT_PRODUCT_SALES_FEE' ? '-' : ''}{formatCurrency(Math.abs(item.amount))}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-gray-500">{formatDateTime(item.confirmedAt)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* 페이지네이션 */}
                                    {allItems.totalPages > 1 && (
                                        <div className="px-6 py-4 border-t flex items-center justify-between">
                                            <p className="text-sm text-gray-500">
                                                {itemsPage * ITEMS_SIZE + 1}-{Math.min((itemsPage + 1) * ITEMS_SIZE, allItems.totalElements)}건
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => loadAllItems(itemsPage - 1)}
                                                    disabled={allItems.first}
                                                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <span className="text-sm text-gray-600">
                                                    {itemsPage + 1} / {allItems.totalPages}
                                                </span>
                                                <button
                                                    onClick={() => loadAllItems(itemsPage + 1)}
                                                    disabled={allItems.last}
                                                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <p className="mb-2">해당 기간에 정산 항목이 없습니다.</p>
                                    <p className="text-sm">일간 배치를 실행하면 구매 확정된 주문이 정산 항목으로 수집됩니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 변경 이력 탭 */}
                {activeTab === 'logs' && (
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        {logsLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black" />
                            </div>
                        ) : allLogs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">로그 ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">정산 ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이전 상태</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">변경 상태</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">사유</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">실행자</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">일시</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {allLogs.map(log => (
                                            <tr key={log.logId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-900">{log.logId}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{log.settlementId}</td>
                                                <td className="px-6 py-4">
                                                    {log.previousStatus ? (
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[log.previousStatus]}`}>
                                                            {STATUS_LABELS[log.previousStatus]}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[log.newStatus]}`}>
                                                        {STATUS_LABELS[log.newStatus]}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{log.reason || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                                        {log.actorType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(log.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">변경 이력이 없습니다.</div>
                        )}
                    </div>
                )}

                {/* 배치 실행 탭 */}
                {activeTab === 'batch' && (
                    <div className="space-y-6">
                        {/* 배치 실행 카드들 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 일간 배치 */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">일간 배치</h3>
                                        <p className="text-xs text-gray-500">주문 정보 수집</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">
                                    선택한 날짜의 구매 확정된 주문 정보를 수집합니다.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">대상 일자</label>
                                        <input
                                            type="date"
                                            value={dailyBatchDate}
                                            onChange={e => setDailyBatchDate(e.target.value)}
                                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <button
                                        onClick={runDailyBatch}
                                        disabled={dailyBatchLoading || !dailyBatchDate}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {dailyBatchLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                                실행 중...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-5 h-5" />
                                                일간 배치 실행
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* 월간 배치 */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">월간 배치</h3>
                                        <p className="text-xs text-gray-500">정산서 생성 및 완료 처리</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">
                                    선택한 월의 정산서를 생성하고 완료 처리합니다.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">대상 월</label>
                                        <input
                                            type="month"
                                            value={monthlyBatchMonth}
                                            onChange={e => setMonthlyBatchMonth(e.target.value)}
                                            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>

                                    <button
                                        onClick={runMonthlyBatch}
                                        disabled={monthlyBatchLoading || !monthlyBatchMonth}
                                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {monthlyBatchLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                                실행 중...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-5 h-5" />
                                                월간 배치 실행
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 배치 에러 */}
                        {batchError && (
                            <div className={`border rounded-xl p-6 ${
                                batchError.code.includes('ALREADY_PROCESSED')
                                    ? 'border-orange-200 bg-orange-50'
                                    : 'border-red-200 bg-red-50'
                            }`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertCircle className={`w-6 h-6 ${
                                        batchError.code.includes('ALREADY_PROCESSED')
                                            ? 'text-orange-600'
                                            : 'text-red-600'
                                    }`} />
                                    <h4 className={`font-semibold ${
                                        batchError.code.includes('ALREADY_PROCESSED')
                                            ? 'text-orange-800'
                                            : 'text-red-800'
                                    }`}>
                                        {batchError.code.includes('ALREADY_PROCESSED') ? '이미 처리됨' : '배치 실행 실패'}
                                    </h4>
                                </div>
                                <p className={`text-sm ${
                                    batchError.code.includes('ALREADY_PROCESSED')
                                        ? 'text-orange-700'
                                        : 'text-red-700'
                                }`}>
                                    {batchError.message}
                                </p>
                                <button
                                    onClick={() => setBatchError(null)}
                                    className={`mt-3 text-sm underline ${
                                        batchError.code.includes('ALREADY_PROCESSED')
                                            ? 'text-orange-600 hover:text-orange-800'
                                            : 'text-red-600 hover:text-red-800'
                                    }`}
                                >
                                    닫기
                                </button>
                            </div>
                        )}

                        {/* 배치 결과 */}
                        {batchResult && (
                            <div className={`border rounded-xl p-6 ${batchResult.status === 'COMPLETED' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    {batchResult.status === 'COMPLETED' ? (
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    ) : (
                                        <AlertCircle className="w-6 h-6 text-yellow-600" />
                                    )}
                                    <h4 className={`font-semibold ${batchResult.status === 'COMPLETED' ? 'text-green-800' : 'text-yellow-800'}`}>
                                        배치 실행 {batchResult.status === 'COMPLETED' ? '완료' : batchResult.status}
                                    </h4>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className={batchResult.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}>Job ID</p>
                                        <p className={`font-medium ${batchResult.status === 'COMPLETED' ? 'text-green-800' : 'text-yellow-800'}`}>{batchResult.jobId}</p>
                                    </div>
                                    <div>
                                        <p className={batchResult.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}>Job 종류</p>
                                        <p className={`font-medium ${batchResult.status === 'COMPLETED' ? 'text-green-800' : 'text-yellow-800'}`}>
                                            {batchResult.jobName === 'dailySettlementJob' ? '일간' : '월간'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={batchResult.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}>대상 날짜</p>
                                        <p className={`font-medium ${batchResult.status === 'COMPLETED' ? 'text-green-800' : 'text-yellow-800'}`}>{batchResult.targetDate}</p>
                                    </div>
                                    <div>
                                        <p className={batchResult.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}>처리 건수</p>
                                        <p className={`font-medium ${batchResult.status === 'COMPLETED' ? 'text-green-800' : 'text-yellow-800'}`}>{batchResult.processedCount}건</p>
                                    </div>
                                    <div className="col-span-2 md:col-span-4">
                                        <p className={batchResult.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}>실행 시간</p>
                                        <p className={`font-medium ${batchResult.status === 'COMPLETED' ? 'text-green-800' : 'text-yellow-800'}`}>
                                            {formatDateTime(batchResult.startTime)} ~ {formatDateTime(batchResult.endTime)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 배치 실행 내역 */}
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="p-4 border-b flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">배치 실행 내역</h3>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={batchHistoryFilter}
                                        onChange={e => setBatchHistoryFilter(e.target.value)}
                                        className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                                    >
                                        <option value="">전체</option>
                                        <option value="daily">일간 배치</option>
                                        <option value="monthly">월간 배치</option>
                                    </select>
                                    <button
                                        onClick={loadBatchHistory}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <RefreshCw className="w-4 h-4 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                            {batchHistoryLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black" />
                                </div>
                            ) : batchHistory.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">종류</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">대상 날짜</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">처리 건수</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">시작 시간</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">종료 시간</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {batchHistory.map(batch => (
                                                <tr key={batch.jobId} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-900">{batch.jobId}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                            batch.jobName === 'dailySettlementJob'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-green-100 text-green-800'
                                                        }`}>
                                                            {batch.jobName === 'dailySettlementJob' ? '일간' : '월간'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                            batch.status === 'COMPLETED'
                                                                ? 'bg-green-100 text-green-800'
                                                                : batch.status === 'FAILED'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {batch.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{batch.targetDate}</td>
                                                    <td className="px-4 py-3 text-sm text-right text-gray-900">{batch.processedCount}건</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(batch.startTime)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(batch.endTime)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">배치 실행 내역이 없습니다.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};
