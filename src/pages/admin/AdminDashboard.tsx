import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminSettlementService } from '../../services/settlementService';
import type { SettlementDashboard, SettlementStatus } from '../../types/settlement';

const STATUS_CONFIG: Record<SettlementStatus, { label: string; color: string }> = {
    PENDING: { label: '대기', color: 'bg-amber-400' },
    HOLD: { label: '보류', color: 'bg-orange-400' },
    COMPLETED: { label: '완료', color: 'bg-emerald-500' },
    FAILED: { label: '실패', color: 'bg-red-500' },
};

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<SettlementDashboard | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await adminSettlementService.getDashboard();
                setData(res);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <div className="w-8 h-8 border-[3px] border-gray-200 border-t-[#e60023] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
                <p className="text-gray-500 mt-1">서비스 현황을 확인하세요</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div
                    onClick={() => navigate('/admin/settlement')}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="text-sm font-medium text-gray-500 mb-1">전체 정산</div>
                    <div className="text-3xl font-bold text-gray-900">{(data?.totalCount || 0).toLocaleString()}</div>
                </div>
                <div
                    onClick={() => navigate('/admin/settlement')}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="text-sm font-medium text-gray-500 mb-1">대기중</div>
                    <div className="text-3xl font-bold text-amber-500">{(data?.countByStatus?.PENDING || 0).toLocaleString()}</div>
                </div>
                <div
                    onClick={() => navigate('/admin/settlement')}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="text-sm font-medium text-gray-500 mb-1">보류</div>
                    <div className="text-3xl font-bold text-orange-500">{(data?.countByStatus?.HOLD || 0).toLocaleString()}</div>
                </div>
                <div
                    onClick={() => navigate('/admin/settlement')}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                    <div className="text-sm font-medium text-gray-500 mb-1">완료</div>
                    <div className="text-3xl font-bold text-emerald-500">{(data?.countByStatus?.COMPLETED || 0).toLocaleString()}</div>
                </div>
                <div
                    onClick={() => navigate('/admin/settlement')}
                    className={`rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                        (data?.countByStatus?.FAILED || 0) > 0
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-white'
                    }`}
                >
                    <div className="text-sm font-medium text-gray-500 mb-1">실패</div>
                    <div className={`text-3xl font-bold ${(data?.countByStatus?.FAILED || 0) > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {(data?.countByStatus?.FAILED || 0).toLocaleString()}
                    </div>
                    {(data?.countByStatus?.FAILED || 0) > 0 && (
                        <div className="text-xs text-red-500 mt-1 font-medium">확인 필요</div>
                    )}
                </div>
            </div>

            {/* Status Overview */}
            {data && (
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">정산 현황</h2>
                        <button
                            onClick={() => navigate('/admin/settlement')}
                            className="text-sm font-semibold text-[#e60023] hover:underline"
                        >
                            전체보기
                        </button>
                    </div>
                    <div className="space-y-4">
                        {(['PENDING', 'HOLD', 'COMPLETED', 'FAILED'] as SettlementStatus[]).map((status) => {
                            const count = data.countByStatus[status] || 0;
                            const total = data.totalCount || 1;
                            const percent = Math.round((count / total) * 100);
                            const config = STATUS_CONFIG[status];

                            return (
                                <div key={status}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{config.label}</span>
                                        <span className="text-sm font-semibold text-gray-900">{count.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${config.color} rounded-full transition-all`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                    onClick={() => navigate('/admin/settlement')}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all text-left group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">정산 관리</h3>
                    <p className="text-sm text-gray-500">정산 현황 확인 및 배치 실행</p>
                </button>

                <button
                    onClick={() => navigate('/admin/product')}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all text-left group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">상품 등록</h3>
                    <p className="text-sm text-gray-500">새로운 상품 등록하기</p>
                </button>

                <button
                    onClick={() => navigate('/admin/products')}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all text-left group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">상품 관리</h3>
                    <p className="text-sm text-gray-500">등록된 상품 관리</p>
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;
