import React, { useState, useEffect, useCallback } from 'react';
import { getBidSpamLogs } from '../../api/admin';
import type { BidSpamLogResponse } from '../../types/admin';
import { ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';

const FormCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-white rounded-2xl p-8 border border-gray-100 shadow-sm ${className}`}>
        <h3 className="text-xl font-bold text-[#333] mb-8 pb-4 border-b border-gray-100 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={24} />
            {title}
        </h3>
        {children}
    </div>
);

export const AdminBidSpamLogs = () => {
    const [logs, setLogs] = useState<BidSpamLogResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const pageSize = 20;

    const fetchLogs = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            const data = await getBidSpamLogs(page, pageSize);
            setLogs(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (err) {
            setError('입찰 스팸 로그를 불러오는 데 실패했습니다.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [pageSize]);

    useEffect(() => {
        fetchLogs(currentPage);
    }, [currentPage, fetchLogs]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-[100px] pb-24 px-6 font-pretendard">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <h2 className="text-3xl font-black text-[#333] tracking-tight">입찰 스팸 로그 조회</h2>
                </div>

                <FormCard title={`탐지된 로그 목록 (총 ${totalElements}건)`}>
                    {isLoading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-500" size={32} /></div>
                    ) : error ? (
                        <div className="text-center text-red-500 p-8">{error}</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="py-4 px-4 font-semibold text-gray-500">ID</th>
                                            <th className="py-4 px-4 font-semibold text-gray-500">User ID</th>
                                            <th className="py-4 px-4 font-semibold text-gray-500">요청 횟수</th>
                                            <th className="py-4 px-4 font-semibold text-gray-500">시간 윈도우(분)</th>
                                            <th className="py-4 px-4 font-semibold text-gray-500">제재 단계</th>
                                            <th className="py-4 px-4 font-semibold text-gray-500">탐지 일시</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map(log => (
                                            <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-4 text-gray-800">{log.id}</td>
                                                <td className="py-4 px-4 text-gray-800 font-medium">{log.userId}</td>
                                                <td className="py-4 px-4 text-red-500 font-semibold">{log.requestCount}회</td>
                                                <td className="py-4 px-4 text-gray-600">{log.timeWindowMinutes}분</td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${log.banLevel === 'FIRST' ? 'bg-yellow-100 text-yellow-700' :
                                                            log.banLevel === 'SECOND' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {log.banLevel}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-gray-500 text-sm">
                                                    {new Date(log.createdAt).toLocaleString('ko-KR')}
                                                </td>
                                            </tr>
                                        ))}
                                        {logs.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="text-center text-gray-500 py-12">탐지된 입찰 스팸 로그가 없습니다.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <div className="flex gap-1">
                                        {Array.from({ length: totalPages }).map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handlePageChange(idx)}
                                                className={`w-10 h-10 rounded-xl font-semibold transition-all ${currentPage === idx
                                                        ? 'bg-gray-900 text-white'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages - 1}
                                        className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </FormCard>
            </div>
        </div>
    );
};
