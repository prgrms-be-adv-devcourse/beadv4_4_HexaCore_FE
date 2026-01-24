import { useState, useEffect, useCallback } from 'react';
import {
    DollarSign, Clock, CheckCircle, AlertCircle, Pause, Play,
    FileText, RefreshCw, Search, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { adminSettlementService } from '../../services/settlementService';
import type {
    Settlement, SettlementLog, SettlementDashboard, BatchExecutionResponse,
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
    const [activeTab, setActiveTab] = useState<'dashboard' | 'settlements' | 'logs' | 'batch'>('dashboard');

    // 대시보드 상태
    const [dashboard, setDashboard] = useState<SettlementDashboard | null>(null);
    const [dashboardLoading, setDashboardLoading] = useState(false);

    // 정산 목록 상태
    const [settlements, setSettlements] = useState<PageResponse<Settlement> | null>(null);
    const [settlementsLoading, setSettlementsLoading] = useState(false);
    const [filter, setFilter] = useState<SettlementFilter>({ page: 0, size: 10 });

    // 정산 상세 모달
    const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
    const [settlementLogs, setSettlementLogs] = useState<SettlementLog[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);

    // 로그 상태
    const [allLogs, setAllLogs] = useState<SettlementLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // 배치 상태
    const [batchMonth, setBatchMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [batchResult, setBatchResult] = useState<BatchExecutionResponse | null>(null);
    const [batchLoading, setBatchLoading] = useState(false);

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

    // 정산 상세 로드
    const loadSettlementDetail = useCallback(async (settlement: Settlement) => {
        setSelectedSettlement(settlement);
        setDetailLoading(true);
        try {
            const logs = await adminSettlementService.getSettlementLogs(settlement.settlementId);
            setSettlementLogs(logs);
        } catch (error) {
            console.error('정산 로그 로드 실패:', error);
            setSettlementLogs([]);
        } finally {
            setDetailLoading(false);
        }
    }, []);

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

    // 배치 실행
    const runBatch = async () => {
        if (!batchMonth) return;
        setBatchLoading(true);
        setBatchResult(null);
        try {
            const result = await adminSettlementService.runBatch(batchMonth);
            setBatchResult(result);
            loadDashboard();
            loadSettlements();
        } catch (error) {
            console.error('배치 실행 실패:', error);
            alert('배치 실행에 실패했습니다.');
        } finally {
            setBatchLoading(false);
        }
    };

    // 최근 정산 목록 (대시보드용)
    const [recentSettlements, setRecentSettlements] = useState<Settlement[]>([]);
    const [recentLoading, setRecentLoading] = useState(false);

    // 최근 정산 로드
    const loadRecentSettlements = useCallback(async () => {
        setRecentLoading(true);
        try {
            const data = await adminSettlementService.getSettlements({ page: 0, size: 5 });
            setRecentSettlements(data.content);
        } catch (error) {
            console.error('최근 정산 로드 실패:', error);
        } finally {
            setRecentLoading(false);
        }
    }, []);

    // 초기 로드
    useEffect(() => {
        loadDashboard();
        loadRecentSettlements();
    }, [loadDashboard, loadRecentSettlements]);

    useEffect(() => {
        if (activeTab === 'settlements') loadSettlements();
        if (activeTab === 'logs') loadAllLogs();
    }, [activeTab, loadSettlements, loadAllLogs]);

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
                                loadRecentSettlements();
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
                                    ) : recentSettlements.length > 0 ? (
                                        <div className="divide-y">
                                            {recentSettlements.map(settlement => (
                                                <div
                                                    key={settlement.settlementId}
                                                    onClick={() => loadSettlementDetail(settlement)}
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
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">판매자</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">정산 기간</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">매출액</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">수수료</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">정산액</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {settlements.content.map(settlement => (
                                                    <tr
                                                        key={settlement.settlementId}
                                                        onClick={() => loadSettlementDetail(settlement)}
                                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                                    >
                                                        <td className="px-6 py-4 text-sm text-gray-900">{settlement.settlementId}</td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{settlement.sellerName}</p>
                                                                <p className="text-gray-500">ID: {settlement.sellerId}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[settlement.status]}`}>
                                                                {STATUS_ICONS[settlement.status]}
                                                                {STATUS_LABELS[settlement.status]}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {formatDate(settlement.startAt)} ~ {formatDate(settlement.endAt)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-right text-gray-900">
                                                            {formatCurrency(settlement.totalSalesAmount)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-right text-red-600">
                                                            -{formatCurrency(settlement.totalFeeAmount)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                                                            {formatCurrency(settlement.totalNetAmount)}
                                                        </td>
                                                    </tr>
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
                    <div className="max-w-xl mx-auto space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">정산 배치 실행</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                선택한 월의 정산 데이터를 집계하고 처리합니다.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">대상 월</label>
                                    <input
                                        type="month"
                                        value={batchMonth}
                                        onChange={e => setBatchMonth(e.target.value)}
                                        className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>

                                <button
                                    onClick={runBatch}
                                    disabled={batchLoading || !batchMonth}
                                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {batchLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                            실행 중...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5" />
                                            배치 실행
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* 배치 결과 */}
                        {batchResult && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                    <h4 className="font-semibold text-green-800">배치 실행 완료</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-green-600">Job ID</p>
                                        <p className="font-medium text-green-800">{batchResult.jobId}</p>
                                    </div>
                                    <div>
                                        <p className="text-green-600">상태</p>
                                        <p className="font-medium text-green-800">{batchResult.status}</p>
                                    </div>
                                    <div>
                                        <p className="text-green-600">대상 월</p>
                                        <p className="font-medium text-green-800">{batchResult.targetMonth}</p>
                                    </div>
                                    <div>
                                        <p className="text-green-600">처리 건수</p>
                                        <p className="font-medium text-green-800">{batchResult.processedCount}건</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-green-600">실행 시간</p>
                                        <p className="font-medium text-green-800">
                                            {formatDateTime(batchResult.startTime)} ~ {formatDateTime(batchResult.endTime)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 정산 상세 모달 */}
            {selectedSettlement && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-semibold">정산 상세 #{selectedSettlement.settlementId}</h3>
                            <button
                                onClick={() => setSelectedSettlement(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                            {/* 기본 정보 */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500">판매자</p>
                                    <p className="font-medium">{selectedSettlement.sellerName} (ID: {selectedSettlement.sellerId})</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">상태</p>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[selectedSettlement.status]}`}>
                                        {STATUS_ICONS[selectedSettlement.status]}
                                        {STATUS_LABELS[selectedSettlement.status]}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">정산 기간</p>
                                    <p className="font-medium">{formatDate(selectedSettlement.startAt)} ~ {formatDate(selectedSettlement.endAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">예정일</p>
                                    <p className="font-medium">{formatDate(selectedSettlement.expectedAt)}</p>
                                </div>
                            </div>

                            {/* 금액 정보 */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-sm text-gray-500">매출액</p>
                                        <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedSettlement.totalSalesAmount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">수수료</p>
                                        <p className="text-lg font-bold text-red-600">-{formatCurrency(selectedSettlement.totalFeeAmount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">정산액</p>
                                        <p className="text-lg font-bold text-green-600">{formatCurrency(selectedSettlement.totalNetAmount)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 상태 변경 이력 */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">상태 변경 이력</h4>
                                {detailLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-black" />
                                    </div>
                                ) : settlementLogs.length > 0 ? (
                                    <div className="space-y-3">
                                        {settlementLogs.map(log => (
                                            <div key={log.logId} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
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
                                    <p className="text-center py-8 text-gray-500">변경 이력이 없습니다.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
