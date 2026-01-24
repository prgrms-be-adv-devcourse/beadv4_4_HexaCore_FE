import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmTossPayment } from '../api/cash';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    useEffect(() => {
        const confirm = async () => {
            if (!paymentKey || !orderId || !amount) {
                setStatus('error');
                setMessage('결제 정보가 누락되었습니다.');
                return;
            }

            try {
                await confirmTossPayment(paymentKey, orderId, parseInt(amount));
                setStatus('success');
                // 3초 후 이동
                setTimeout(() => {
                    navigate('/mypage');
                }, 3000);
            } catch (error: any) {
                console.error('Payment confirmation failed:', error);
                setStatus('error');
                setMessage(error.response?.data?.message || '결제 승인 중 오류가 발생했습니다.');
            }
        };

        confirm();
    }, [paymentKey, orderId, amount, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-gray-50 text-center">
                {status === 'loading' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <Loader2 size={64} className="text-accent animate-spin" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900">결제 승인 중...</h1>
                        <p className="text-gray-400 font-medium leading-relaxed">
                            토스페이먼츠로부터 결제 승인을 확인하고 있습니다.<br />
                            잠시만 기다려 주세요.
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                                <CheckCircle size={48} className="text-green-500" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900">결제가 완료되었습니다!</h1>
                        <p className="text-gray-400 font-medium leading-relaxed">
                            구매 입찰 등록이 성공적으로 완료되었습니다.<br />
                            3초 후 마이페이지로 이동합니다.
                        </p>
                        <button
                            onClick={() => navigate('/mypage')}
                            className="w-full h-14 bg-accent text-white rounded-2xl font-bold text-base hover:bg-[#4a58b0] transition-colors"
                        >
                            마이페이지로 이동
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                                <AlertCircle size={48} className="text-red-500" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900">결제 승인 실패</h1>
                        <p className="text-red-500 font-bold leading-relaxed">
                            {message}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex-1 h-14 bg-gray-100 text-gray-900 rounded-2xl font-bold text-base hover:bg-gray-200 transition-colors"
                            >
                                뒤로 가기
                            </button>
                            <button
                                onClick={() => navigate('/shop')}
                                className="flex-1 h-14 bg-accent text-white rounded-2xl font-bold text-base hover:bg-[#4a58b0] transition-colors"
                            >
                                쇼핑으로 돌아가기
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
