import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, XCircle } from 'lucide-react';

export const PaymentFailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const code = searchParams.get('code');
    const message = searchParams.get('message');

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4 font-pretendard">
            <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-gray-50 text-center">
                <div className="space-y-6">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                            <XCircle size={48} className="text-red-500" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-gray-900">결제에 실패했습니다</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">ERROR CODE: {code || 'UNKNOWN'}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic">
                        <p className="text-gray-600 font-medium">
                            "{message || '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'}"
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 h-16 bg-[#222] text-white rounded-2xl font-black text-sm hover:bg-[#333] transition-all active:scale-[0.98]"
                        >
                            다시 시도하기
                        </button>
                        <button
                            onClick={() => navigate('/shop')}
                            className="flex-1 h-16 bg-white text-[#222] border-2 border-gray-100 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all active:scale-[0.98]"
                        >
                            쇼핑홈으로
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
