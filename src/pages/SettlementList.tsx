import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { settlementService } from '../services/settlementService';
import type { Settlement, SettlementStatus } from '../types/settlement';
import './SettlementList.css';

// 상태별 한글 라벨
const STATUS_LABELS: Record<SettlementStatus, string> = {
    PENDING: '정산 대기',
    HOLD: '정산 보류',
    COMPLETED: '정산 완료',
    FAILED: '정산 실패',
};

export const SettlementList = () => {
    const navigate = useNavigate();

    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // 금액 포맷
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    };

    // 날짜 포맷
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // 기간 포맷
    const formatPeriod = (startAt: string, _endAt: string) => {
        const start = new Date(startAt);
        return `${start.getFullYear()}년 ${start.getMonth() + 1}월`;
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
        return '정산 내역을 불러오는데 실패했습니다.';
    };

    // 데이터 조회
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await settlementService.getSettlements(startDate || undefined, endDate || undefined);
                setSettlements(data.content);
            } catch (err) {
                setError(extractErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [startDate, endDate]);

    // 통계 계산
    const stats = {
        totalNet: settlements.reduce((sum, s) => sum + s.totalNetAmount, 0),
    };

    if (loading) {
        return (
            <div className="sl-settlement-list">
                <div className="sl-loading-container">
                    <div className="sl-loading-spinner" />
                    <p>정산 내역을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="sl-settlement-list">
                <div className="sl-error-container">
                    <AlertCircle size={48} />
                    <h2>오류가 발생했습니다</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate(-1)}>돌아가기</button>
                </div>
            </div>
        );
    }

    return (
        <div className="sl-settlement-list">
            {/* 헤더 */}
            <div className="sl-list-header">
                <h1>정산 내역</h1>
            </div>

            {/* 요약 정보 */}
            <div className="sl-summary-section">
                <div className="sl-summary-item">
                    <span className="sl-summary-label">총 정산 금액</span>
                    <span className="sl-summary-value highlight">{formatAmount(stats.totalNet)}</span>
                </div>
            </div>

            {/* 조회 기간 필터 */}
            <div className="sl-date-filter-section">
                <span className="sl-filter-label">조회 기간</span>
                <div className="sl-date-inputs">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="sl-date-input"
                    />
                    <span className="sl-date-separator">~</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="sl-date-input"
                    />
                    {(startDate || endDate) && (
                        <button
                            className="sl-filter-reset"
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                        >
                            초기화
                        </button>
                    )}
                </div>
            </div>

            {/* 정산 목록 */}
            <div className="sl-settlements-container">
                {settlements.length === 0 ? (
                    <div className="sl-empty-list">
                        <p>정산 내역이 없습니다</p>
                    </div>
                ) : (
                    <div className="sl-settlements-list">
                        {settlements.map(settlement => (
                            <div
                                key={settlement.settlementId}
                                className="sl-settlement-card"
                                onClick={() => navigate(`/mypage/settlement/${settlement.settlementId}`, { state: { settlement } })}
                            >
                                <div className="sl-settlement-main">
                                    <div className="sl-settlement-period">
                                        <span>{formatPeriod(settlement.startAt, settlement.endAt)}</span>
                                    </div>
                                    <div className={`sl-settlement-status ${settlement.status.toLowerCase().replace('_', '-')}`}>
                                        <span>{STATUS_LABELS[settlement.status]}</span>
                                    </div>
                                </div>

                                <div className="sl-settlement-amounts">
                                    <div className="sl-amount-row">
                                        <span className="sl-amount-label">매출액</span>
                                        <span className="sl-amount-value">{formatAmount(settlement.totalSalesAmount)}</span>
                                    </div>
                                    <div className="sl-amount-row">
                                        <span className="sl-amount-label">수수료</span>
                                        <span className="sl-amount-value fee">-{formatAmount(settlement.totalFeeAmount)}</span>
                                    </div>
                                    <div className="sl-amount-row net">
                                        <span className="sl-amount-label">정산금액</span>
                                        <span className="sl-amount-value net">{formatAmount(settlement.totalNetAmount)}</span>
                                    </div>
                                </div>

                                <div className="sl-settlement-footer">
                                    {settlement.status === 'COMPLETED' && settlement.completedAt && (
                                        <span className="sl-settlement-date">
                                            정산 완료: {formatDate(settlement.completedAt)}
                                        </span>
                                    )}
                                    {settlement.status === 'FAILED' && (
                                        <span className="sl-settlement-date" style={{ color: '#dc2626' }}>
                                            지급 처리 실패 - 계좌 정보를 확인해주세요
                                        </span>
                                    )}
                                    <ChevronRight size={20} className="sl-arrow-icon" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 안내 */}
            <div className="sl-info-section">
                <h4>정산 안내</h4>
                <ul>
                    <li>정산은 매월 1일에 전월 판매 확정 건에 대해 자동으로 생성됩니다.</li>
                    <li>정산 예정일로부터 영업일 기준 3일 이내 등록된 계좌로 입금됩니다.</li>
                    <li>정산 상세를 클릭하면 항목별 내역을 확인할 수 있습니다.</li>
                </ul>
            </div>
        </div>
    );
};
