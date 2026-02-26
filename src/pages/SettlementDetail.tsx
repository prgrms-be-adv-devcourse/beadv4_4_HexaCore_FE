import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, DollarSign, Clock, CheckCircle, AlertCircle,
    Pause, Calendar, CreditCard, TrendingUp, Package,
    Search, X, ArrowUpDown
} from 'lucide-react';
import { settlementService } from '../services/settlementService';
import type {
    Settlement, SettlementItem,
    SettlementStatus, SettlementItemStatus
} from '../types/settlement';

// 상태별 한글 라벨
const STATUS_LABELS: Record<SettlementStatus, string> = {
    PENDING: '정산 대기',
    HOLD: '정산 보류',
    COMPLETED: '정산 완료',
    FAILED: '정산 실패',
};

const STATUS_DESC: Record<SettlementStatus, string> = {
    PENDING: '정산이 예정되어 있습니다.',
    HOLD: '정산이 일시 보류되었습니다.',
    COMPLETED: '정산이 완료되어 입금되었습니다.',
    FAILED: '정산 처리 중 문제가 발생했습니다.',
};

const ITEM_STATUS_LABELS: Record<SettlementItemStatus, string> = {
    COLLECTED: '수집됨',
    INCLUDED: '정산 포함',
    CANCELED: '주문 취소',
    REFUNDED: '환불 처리',
    NEGATIVE: '차감 조정',
};

// 상태별 아이콘
const STATUS_ICONS: Record<SettlementStatus, React.ReactNode> = {
    PENDING: <Clock size={24} />,
    HOLD: <Pause size={24} />,
    COMPLETED: <CheckCircle size={24} />,
    FAILED: <AlertCircle size={24} />,
};

// 상태별 배경색 클래스
const STATUS_BG_CLASSES: Record<SettlementStatus, string> = {
    PENDING: 'bg-amber-500',
    HOLD: 'bg-purple-500',
    COMPLETED: 'bg-green-500',
    FAILED: 'bg-red-500',
};

// 항목 상태별 스타일 클래스
const ITEM_STATUS_CLASSES: Record<SettlementItemStatus, string> = {
    COLLECTED: 'bg-blue-100 text-blue-800',
    INCLUDED: 'bg-green-100 text-green-800',
    CANCELED: 'bg-gray-200 text-gray-700',
    REFUNDED: 'bg-yellow-100 text-yellow-800',
    NEGATIVE: 'bg-red-100 text-red-800',
};

type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

export const SettlementDetail = () => {
    const { settlementId } = useParams<{ settlementId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [settlement, setSettlement] = useState<Settlement | null>(null);
    const [items, setItems] = useState<SettlementItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 필터 상태
    const [statusFilter, setStatusFilter] = useState<SettlementItemStatus | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('date_desc');

    // 금액 포맷
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    };

    // 날짜 포맷
    const formatDate = (dateString: string | null, format: 'date' | 'datetime' = 'date') => {
        if (!dateString) return '-';
        const options: Intl.DateTimeFormatOptions = format === 'datetime'
            ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
            : { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ko-KR', options);
    };

    // 날짜 문자열에서 yyyy-MM-dd 형식 추출
    const extractDateString = (dateTime: string): string => {
        return dateTime.split('T')[0];
    };

    // 에러 메시지 추출
    const extractErrorMessage = (error: unknown): string => {
        if (error && typeof error === 'object') {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            if (err.response?.data?.message) {
                return err.response.data.message;
            }
            if (err.message) {
                return err.message;
            }
        }
        return '정산 정보를 불러오는데 실패했습니다.';
    };

    // 데이터 조회
    useEffect(() => {
        const fetchData = async () => {
            if (!settlementId) return;

            try {
                setLoading(true);
                setError(null);

                // 1. 네비게이션 state에서 정산 데이터 가져오기 (SettlementList에서 전달)
                let found: Settlement | undefined = (location.state as { settlement?: Settlement })?.settlement;

                // 2. state가 없으면 (직접 URL 접근 등) 목록에서 검색
                if (!found) {
                    const settlementsData = await settlementService.getSettlements(undefined, undefined, 0, 100);
                    found = settlementsData.content.find(s => s.settlementId === Number(settlementId));
                }

                if (!found) {
                    setError('정산 내역을 찾을 수 없습니다.');
                    return;
                }

                setSettlement(found);

                // 해당 정산 기간의 항목 조회 (startAt ~ endAt)
                const itemsData = await settlementService.getSettlementItems({
                    startDate: extractDateString(found.startAt),
                    endDate: extractDateString(found.endAt),
                    page: 0,
                    size: 100,
                });
                setItems(itemsData.content);
            } catch (err) {
                setError(extractErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [settlementId]);

    // 판매 수익 항목만 필터링
    const salesItems = useMemo(() => {
        return items.filter(item => item.eventType === 'SETTLEMENT_PRODUCT_SALES_AMOUNT');
    }, [items]);

    const feeItems = useMemo(() => {
        return items.filter(item => item.eventType === 'SETTLEMENT_PRODUCT_SALES_FEE');
    }, [items]);

    // 필터링 및 정렬된 항목
    const filteredItems = useMemo(() => {
        let result = [...salesItems];

        // 상태 필터
        if (statusFilter !== 'ALL') {
            result = result.filter(item => item.status === statusFilter);
        }

        // 검색어 필터 (주문 ID, 상품 ID)
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            result = result.filter(item =>
                item.orderId.toString().includes(query) ||
                item.productId.toString().includes(query)
            );
        }

        // 정렬
        result.sort((a, b) => {
            switch (sortOption) {
                case 'date_desc':
                    return new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime();
                case 'date_asc':
                    return new Date(a.confirmedAt).getTime() - new Date(b.confirmedAt).getTime();
                case 'amount_desc':
                    return b.amount - a.amount;
                case 'amount_asc':
                    return a.amount - b.amount;
                default:
                    return 0;
            }
        });

        return result;
    }, [salesItems, statusFilter, searchQuery, sortOption]);

    // 필터 초기화
    const resetFilters = () => {
        setStatusFilter('ALL');
        setSearchQuery('');
        setSortOption('date_desc');
    };

    // 필터 활성화 여부
    const hasActiveFilters = statusFilter !== 'ALL' || searchQuery.trim() !== '' || sortOption !== 'date_desc';

    if (loading) {
        return (
            <div className="max-w-[900px] mx-auto pt-[120px] px-6 pb-10 min-h-screen bg-gray-100">
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mb-3" />
                    <p>정산 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error || !settlement) {
        return (
            <div className="max-w-[900px] mx-auto pt-[120px] px-6 pb-10 min-h-screen bg-gray-100">
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
                    <AlertCircle size={48} className="text-red-500 mb-3" />
                    <h2 className="text-lg text-gray-800 mb-2 font-semibold">오류가 발생했습니다</h2>
                    <p className="mb-5 text-sm">{error || '정산 내역을 찾을 수 없습니다.'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-5 py-2.5 bg-gray-800 text-white border-none rounded font-medium text-sm cursor-pointer hover:bg-gray-700"
                    >
                        돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[900px] mx-auto pt-[120px] px-6 pb-10 min-h-screen bg-gray-100">
            {/* 상단 네비게이션 */}
            <div className="flex items-center gap-3 mb-5">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-800 cursor-pointer hover:bg-gray-50"
                >
                    <ArrowLeft size={20} />
                    <span>돌아가기</span>
                </button>
                <span className="text-sm text-gray-500">정산 상세</span>
            </div>

            {/* 상태 카드 */}
            <div className="flex items-center gap-4 p-5 bg-white rounded-md mb-4 border border-gray-300 max-md:flex-col max-md:text-center max-md:gap-3">
                <div className={`w-12 h-12 rounded-md flex items-center justify-center text-white flex-shrink-0 ${STATUS_BG_CLASSES[settlement.status]}`}>
                    {STATUS_ICONS[settlement.status]}
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800 mb-1">{STATUS_LABELS[settlement.status]}</h2>
                    <p className="text-sm text-gray-600">{STATUS_DESC[settlement.status]}</p>
                </div>
                <div className="text-right max-md:text-center">
                    {settlement.status === 'COMPLETED' && settlement.completedAt ? (
                        <>
                            <span className="block text-xs text-gray-500 mb-0.5">완료일</span>
                            <span className="text-sm font-medium text-gray-800 tabular-nums tracking-tight">{formatDate(settlement.completedAt)}</span>
                        </>
                    ) : (
                        <>
                            <span className="block text-xs text-gray-500 mb-0.5">예정일</span>
                            <span className="text-sm font-medium text-gray-800 tabular-nums tracking-tight">{formatDate(settlement.expectedAt)}</span>
                        </>
                    )}
                </div>
            </div>

            {/* 정산 실패 안내 */}
            {settlement.status === 'FAILED' && (
                <div className="flex items-start gap-3 p-5 bg-red-50 rounded-md mb-4 border border-red-200">
                    <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-red-800 mb-1">정산 실패 안내</h3>
                        <p className="text-sm text-red-700 leading-relaxed">
                            해당 정산 건의 지급 처리 중 문제가 발생하여 정산이 실패되었습니다.
                            등록된 계좌 정보를 확인해주시고, 문제가 지속될 경우 고객센터로 문의해주세요.
                        </p>
                        <div className="mt-3 flex gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                계좌 정보 확인 필요
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* 정산 요약 */}
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">정산 요약</h3>
                <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
                    <div className="flex items-center gap-3 p-4 bg-white rounded-md border border-gray-300">
                        <div className="w-10 h-10 rounded bg-cyan-500 flex items-center justify-center text-white">
                            <TrendingUp size={24} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-gray-500">총 매출액</span>
                            <span className="text-lg font-semibold text-gray-800 tabular-nums tracking-tight">{formatAmount(settlement.totalSalesAmount)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white rounded-md border border-gray-300">
                        <div className="w-10 h-10 rounded bg-red-500 flex items-center justify-center text-white">
                            <CreditCard size={24} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-gray-500">수수료 (10%)</span>
                            <span className="text-lg font-semibold text-red-500 tabular-nums tracking-tight">-{formatAmount(settlement.totalFeeAmount)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-md border border-gray-800">
                        <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center text-white">
                            <DollarSign size={24} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-gray-500">정산 금액</span>
                            <span className="text-xl font-semibold text-gray-800 tabular-nums tracking-tight">{formatAmount(settlement.totalNetAmount)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 정산 기간 정보 */}
            <div className="flex gap-6 px-5 py-4 bg-white rounded-md border border-gray-300 mb-4 max-md:flex-col max-md:gap-2.5">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Calendar size={18} className="text-gray-500" />
                    <span className="text-gray-500">정산 기간</span>
                    <span className="font-medium text-gray-800 tabular-nums tracking-tight">
                        {formatDate(settlement.startAt)} ~ {formatDate(settlement.endAt)}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Package size={18} className="text-gray-500" />
                    <span className="text-gray-500">정산 항목</span>
                    <span className="font-medium text-gray-800">{salesItems.length}건</span>
                </div>
            </div>

            {/* 정산 항목 헤더 */}
            <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-800">정산 항목</h3>
            </div>

            {/* 필터 영역 */}
            <div className="flex flex-col gap-3 p-4 bg-white rounded-md border border-gray-300 mb-3">
                {/* 검색 */}
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded">
                    <Search size={18} className="text-gray-500 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="주문번호 또는 상품번호 검색"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 border-none bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="flex items-center justify-center w-6 h-6 bg-gray-300 border-none rounded-full cursor-pointer text-gray-600 hover:bg-gray-400"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* 상태 필터 */}
                <div className="flex gap-2 flex-wrap max-md:overflow-x-auto max-md:flex-nowrap max-md:pb-1">
                    {(['ALL', 'COLLECTED', 'INCLUDED', 'CANCELED', 'REFUNDED', 'NEGATIVE'] as const).map((status) => (
                        <button
                            key={status}
                            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-medium cursor-pointer transition-all duration-150 flex-shrink-0 ${
                                statusFilter === status
                                    ? 'bg-gray-800 border-gray-800 text-white'
                                    : 'bg-white border-gray-300 text-gray-600 hover:border-gray-800 hover:text-gray-800'
                            }`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === 'ALL' ? '전체' : ITEM_STATUS_LABELS[status]}
                            <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold ${
                                statusFilter === status ? 'bg-white/20' : 'bg-black/5'
                            }`}>
                                {status === 'ALL'
                                    ? salesItems.length
                                    : salesItems.filter(i => i.status === status).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* 정렬 & 초기화 */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-300 rounded text-gray-600">
                        <ArrowUpDown size={16} className="flex-shrink-0" />
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as SortOption)}
                            className="border-none bg-transparent text-xs font-medium text-gray-800 outline-none cursor-pointer"
                        >
                            <option value="date_desc">최신순</option>
                            <option value="date_asc">오래된순</option>
                            <option value="amount_desc">금액 높은순</option>
                            <option value="amount_asc">금액 낮은순</option>
                        </select>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-red-500 rounded text-xs font-medium text-red-500 cursor-pointer hover:bg-red-50"
                        >
                            <X size={14} />
                            필터 초기화
                        </button>
                    )}
                </div>
            </div>

            {/* 검색 결과 정보 */}
            {hasActiveFilters && (
                <div className="text-xs text-gray-500 mb-2 pl-1">
                    총 {salesItems.length}건 중 {filteredItems.length}건 표시
                </div>
            )}

            {/* 정산 항목 목록 */}
            <div className="bg-white rounded-md border border-gray-300 mb-4">
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-5 text-gray-500 text-sm">
                        <Package size={48} className="mb-3 opacity-40" />
                        <p>{hasActiveFilters ? '검색 조건에 맞는 항목이 없습니다.' : '정산 항목이 없습니다.'}</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {filteredItems.map((item, index) => (
                            <div
                                key={item.settlementItemId}
                                className={`px-5 py-4 hover:bg-gray-50 ${index !== filteredItems.length - 1 ? 'border-b border-gray-100' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-2 max-md:flex-col max-md:gap-2.5">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-medium text-gray-800 text-sm">주문 #{item.orderId}</span>
                                        <span className="text-xs text-gray-500">상품 #{item.productId}</span>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1 max-md:items-start">
                                        <span className="text-base font-semibold text-gray-800 tabular-nums tracking-tight">{formatAmount(item.amount)}</span>
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${ITEM_STATUS_CLASSES[item.status]}`}>
                                            {ITEM_STATUS_LABELS[item.status]}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>
                                        구매확정: {formatDate(item.confirmedAt, 'datetime')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 수수료 항목 요약 */}
                {feeItems.length > 0 && (
                    <div className="px-5 py-4 border-t border-gray-300 bg-gray-50">
                        <h4 className="text-sm font-medium text-gray-600 mb-2.5">수수료 내역</h4>
                        <div className="flex justify-between items-center px-4 py-3 bg-white border border-gray-300 rounded">
                            <span className="text-sm text-gray-600">총 {feeItems.length}건</span>
                            <span className="font-semibold text-red-500 text-base tabular-nums tracking-tight">
                                -{formatAmount(feeItems.reduce((sum, item) => sum + item.amount, 0))}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* 하단 안내 */}
            <div className="p-5 bg-white rounded-md border border-gray-300">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">정산 안내</h4>
                <ul className="list-none p-0 m-0">
                    <li className="relative pl-3.5 text-sm text-gray-600 leading-7 before:content-['•'] before:absolute before:left-0 before:text-gray-500">
                        정산은 매월 1일에 전월 판매 확정 건에 대해 자동으로 진행됩니다.
                    </li>
                    <li className="relative pl-3.5 text-sm text-gray-600 leading-7 before:content-['•'] before:absolute before:left-0 before:text-gray-500">
                        정산 예정일로부터 영업일 기준 3일 이내 등록된 계좌로 입금됩니다.
                    </li>
                    <li className="relative pl-3.5 text-sm text-gray-600 leading-7 before:content-['•'] before:absolute before:left-0 before:text-gray-500">
                        정산 관련 문의는 고객센터로 연락해주세요.
                    </li>
                </ul>
            </div>
        </div>
    );
};
