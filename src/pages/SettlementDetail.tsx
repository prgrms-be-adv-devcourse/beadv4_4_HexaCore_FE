import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, DollarSign, Clock, CheckCircle, AlertCircle,
    Pause, Play, Calendar, CreditCard, TrendingUp, Package,
    Search, X, ArrowUpDown
} from 'lucide-react';
import { settlementService } from '../services/settlementService';
import type {
    Settlement, SettlementItem,
    SettlementStatus, SettlementItemStatus
} from '../types/settlement';
import './SettlementDetail.css';

// 상태별 한글 라벨
const STATUS_LABELS: Record<SettlementStatus, string> = {
    PENDING: '정산 대기',
    IN_PROGRESS: '정산 진행중',
    HOLD: '정산 보류',
    COMPLETED: '정산 완료',
    FAILED: '정산 실패',
};

const STATUS_DESC: Record<SettlementStatus, string> = {
    PENDING: '정산이 예정되어 있습니다.',
    IN_PROGRESS: '정산이 처리되고 있습니다.',
    HOLD: '정산이 일시 보류되었습니다.',
    COMPLETED: '정산이 완료되어 입금되었습니다.',
    FAILED: '정산 처리 중 문제가 발생했습니다.',
};

const ITEM_STATUS_LABELS: Record<SettlementItemStatus, string> = {
    INCLUDED: '정산 포함',
    CANCELED: '주문 취소',
    REFUNDED: '환불 처리',
    NEGATIVE: '차감 조정',
};

// 상태별 아이콘
const STATUS_ICONS: Record<SettlementStatus, React.ReactNode> = {
    PENDING: <Clock size={24} />,
    IN_PROGRESS: <Play size={24} />,
    HOLD: <Pause size={24} />,
    COMPLETED: <CheckCircle size={24} />,
    FAILED: <AlertCircle size={24} />,
};

type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

export const SettlementDetail = () => {
    const { settlementId } = useParams<{ settlementId: string }>();
    const navigate = useNavigate();

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

    // 데이터 조회
    useEffect(() => {
        const fetchData = async () => {
            if (!settlementId) return;

            try {
                setLoading(true);
                setError(null);

                // 정산 목록에서 해당 정산 찾기
                const settlementsData = await settlementService.getSettlements();
                const found = settlementsData.content.find(s => s.settlementId === Number(settlementId));

                if (!found) {
                    setError('정산 내역을 찾을 수 없습니다.');
                    return;
                }

                setSettlement(found);

                // 항목 조회
                const itemsData = await settlementService.getSettlementItems({ page: 0, size: 100 });
                setItems(itemsData.content);
            } catch (err) {
                setError(err instanceof Error ? err.message : '정산 정보를 불러오는데 실패했습니다.');
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
            <div className="sd-detail">
                <div className="sd-loading-container">
                    <div className="sd-loading-spinner" />
                    <p>정산 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error || !settlement) {
        return (
            <div className="sd-detail">
                <div className="sd-error-container">
                    <AlertCircle size={48} />
                    <h2>오류가 발생했습니다</h2>
                    <p>{error || '정산 내역을 찾을 수 없습니다.'}</p>
                    <button onClick={() => navigate(-1)}>돌아가기</button>
                </div>
            </div>
        );
    }

    return (
        <div className="sd-detail">
            {/* 상단 네비게이션 */}
            <div className="sd-nav">
                <button className="sd-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    <span>돌아가기</span>
                </button>
                <span className="sd-nav-title">정산 상세</span>
            </div>

            {/* 상태 카드 */}
            <div className={`sd-status-card ${settlement.status.toLowerCase().replace('_', '-')}`}>
                <div className="sd-status-icon-wrapper">
                    {STATUS_ICONS[settlement.status]}
                </div>
                <div className="sd-status-info">
                    <h2>{STATUS_LABELS[settlement.status]}</h2>
                    <p>{STATUS_DESC[settlement.status]}</p>
                </div>
                <div className="sd-status-date">
                    {settlement.status === 'COMPLETED' && settlement.completedAt ? (
                        <>
                            <span className="sd-date-label">완료일</span>
                            <span className="sd-date-value">{formatDate(settlement.completedAt)}</span>
                        </>
                    ) : (
                        <>
                            <span className="sd-date-label">예정일</span>
                            <span className="sd-date-value">{formatDate(settlement.expectedAt)}</span>
                        </>
                    )}
                </div>
            </div>

            {/* 정산 요약 */}
            <div className="sd-summary-section">
                <h3>정산 요약</h3>
                <div className="sd-summary-grid">
                    <div className="sd-summary-card">
                        <div className="sd-summary-icon sales">
                            <TrendingUp size={24} />
                        </div>
                        <div className="sd-summary-content">
                            <span className="sd-summary-label">총 매출액</span>
                            <span className="sd-summary-value">{formatAmount(settlement.totalSalesAmount)}</span>
                        </div>
                    </div>
                    <div className="sd-summary-card">
                        <div className="sd-summary-icon fee">
                            <CreditCard size={24} />
                        </div>
                        <div className="sd-summary-content">
                            <span className="sd-summary-label">수수료 (10%)</span>
                            <span className="sd-summary-value fee">-{formatAmount(settlement.totalFeeAmount)}</span>
                        </div>
                    </div>
                    <div className="sd-summary-card highlight">
                        <div className="sd-summary-icon net">
                            <DollarSign size={24} />
                        </div>
                        <div className="sd-summary-content">
                            <span className="sd-summary-label">정산 금액</span>
                            <span className="sd-summary-value highlight">{formatAmount(settlement.totalNetAmount)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 정산 기간 정보 */}
            <div className="sd-period-section">
                <div className="sd-period-item">
                    <Calendar size={18} />
                    <span className="sd-period-label">정산 기간</span>
                    <span className="sd-period-value">
                        {formatDate(settlement.startAt)} ~ {formatDate(settlement.endAt)}
                    </span>
                </div>
                <div className="sd-period-item">
                    <Package size={18} />
                    <span className="sd-period-label">정산 항목</span>
                    <span className="sd-period-value">{salesItems.length}건</span>
                </div>
            </div>

            {/* 정산 항목 헤더 */}
            <div className="sd-items-header">
                <h3>정산 항목</h3>
            </div>

            {/* 필터 영역 */}
            <div className="sd-filter-section">
                {/* 검색 */}
                <div className="sd-search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="주문번호 또는 상품번호 검색"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="sd-clear-btn" onClick={() => setSearchQuery('')}>
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* 상태 필터 */}
                <div className="sd-filter-chips">
                    {(['ALL', 'INCLUDED', 'CANCELED', 'REFUNDED', 'NEGATIVE'] as const).map((status) => (
                        <button
                            key={status}
                            className={`sd-filter-chip ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === 'ALL' ? '전체' : ITEM_STATUS_LABELS[status]}
                            <span className="sd-chip-count">
                                {status === 'ALL'
                                    ? salesItems.length
                                    : salesItems.filter(i => i.status === status).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* 정렬 & 초기화 */}
                <div className="sd-filter-actions">
                    <div className="sd-sort-select">
                        <ArrowUpDown size={16} />
                        <select value={sortOption} onChange={(e) => setSortOption(e.target.value as SortOption)}>
                            <option value="date_desc">최신순</option>
                            <option value="date_asc">오래된순</option>
                            <option value="amount_desc">금액 높은순</option>
                            <option value="amount_asc">금액 낮은순</option>
                        </select>
                    </div>
                    {hasActiveFilters && (
                        <button className="sd-reset-btn" onClick={resetFilters}>
                            <X size={14} />
                            필터 초기화
                        </button>
                    )}
                </div>
            </div>

            {/* 검색 결과 정보 */}
            {hasActiveFilters && (
                <div className="sd-filter-result">
                    총 {salesItems.length}건 중 {filteredItems.length}건 표시
                </div>
            )}

            {/* 정산 항목 목록 */}
            <div className="sd-items-section">
                {filteredItems.length === 0 ? (
                    <div className="sd-empty-items">
                        <Package size={48} />
                        <p>{hasActiveFilters ? '검색 조건에 맞는 항목이 없습니다.' : '정산 항목이 없습니다.'}</p>
                    </div>
                ) : (
                    <div className="sd-items-list">
                        {filteredItems.map(item => (
                            <div key={item.settlementItemId} className="sd-item-card">
                                <div className="sd-item-main">
                                    <div className="sd-item-info">
                                        <span className="sd-item-order">주문 #{item.orderId}</span>
                                        <span className="sd-item-product">상품 #{item.productId}</span>
                                    </div>
                                    <div className="sd-item-amount">
                                        <span className="sd-amount-value">{formatAmount(item.amount)}</span>
                                        <span className={`sd-item-status ${item.status.toLowerCase()}`}>
                                            {ITEM_STATUS_LABELS[item.status]}
                                        </span>
                                    </div>
                                </div>
                                <div className="sd-item-meta">
                                    <span className="sd-meta-date">
                                        구매확정: {formatDate(item.confirmedAt, 'datetime')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 수수료 항목 요약 */}
                {feeItems.length > 0 && (
                    <div className="sd-fee-summary">
                        <h4>수수료 내역</h4>
                        <div className="sd-fee-total">
                            <span>총 {feeItems.length}건</span>
                            <span className="sd-fee-amount">
                                -{formatAmount(feeItems.reduce((sum, item) => sum + item.amount, 0))}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* 하단 안내 */}
            <div className="sd-help-section">
                <h4>정산 안내</h4>
                <ul>
                    <li>정산은 매월 1일에 전월 판매 확정 건에 대해 자동으로 진행됩니다.</li>
                    <li>정산 예정일로부터 영업일 기준 3일 이내 등록된 계좌로 입금됩니다.</li>
                    <li>정산 관련 문의는 고객센터로 연락해주세요.</li>
                </ul>
            </div>
        </div>
    );
};
