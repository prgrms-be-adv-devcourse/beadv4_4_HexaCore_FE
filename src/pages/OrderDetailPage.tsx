import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { ArrowLeft, Package, Truck, CheckCircle, Clock, CreditCard, MapPin, ChevronRight, AlertCircle } from 'lucide-react';
import { getOrderDetail, completeOrder } from '../api/market';

interface OrderDetail {
    orderId: number;
    productNumber: string;
    productName: string;
    productSize: string;
    brandName: string;
    thumbnailImage: string;
    price: number;
    orderStatus: string;
    address: string;
    paymentDate: string;
}

export const OrderDetailPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isBuying = location.state?.isBuying ?? true; // 기본값은 true (구매자로 가정)

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;
            setIsLoading(true);
            try {
                const res = await getOrderDetail(Number(orderId));
                setOrder(res.data);
            } catch (error) {
                console.error("Failed to fetch order detail:", error);
                alert("주문 상세 정보를 불러오는 데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handleComplete = async () => {
        if (!orderId || !window.confirm("구매 확정을 진행하시겠습니까? 정산 절차가 시작됩니다.")) return;

        setIsCompleting(true);
        try {
            await completeOrder(Number(orderId));
            alert("구매 확정이 완료되었습니다.");
            // 새로고침하여 상태 업데이트
            const res = await getOrderDetail(Number(orderId));
            setOrder(res.data);
        } catch (error) {
            console.error("Failed to complete order:", error);
            alert("구매 확정에 실패했습니다.");
        } finally {
            setIsCompleting(false);
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'HOLD': '대기 중',
            'PAID': '결제 완료',
            'CANCELLED': '취소됨',
            'DELIVERY_PROCESSING': '배송 준비 중',
            'DELIVERY_COMPLETED': '배송 완료',
            'REFUNDED': '환불됨',
            'COMPLETED': '구매 확정'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
        if (['COMPLETED'].includes(status)) return 'text-green-600 bg-green-50';
        if (['PAID', 'DELIVERY_PROCESSING', 'DELIVERY_COMPLETED'].includes(status)) return 'text-accent bg-accent/5';
        if (['CANCELLED', 'REFUNDED'].includes(status)) return 'text-red-500 bg-red-50';
        return 'text-gray-500 bg-gray-50';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 text-center">
                <p className="text-gray-500 mb-6">주문 정보를 찾을 수 없습니다.</p>
                <button onClick={() => navigate(-1)} className="text-accent font-bold hover:underline">뒤로 가기</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 px-6 lg:px-10 font-pretendard">
            <div className="max-w-[800px] mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#333] transition-colors mb-8 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold">주문 상세 내역</span>
                </button>

                <div className="space-y-6">
                    {/* Status Header */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Order Status</p>
                            <h2 className={`text-2xl font-black ${getStatusColor(order.orderStatus).split(' ')[0]}`}>
                                {getStatusLabel(order.orderStatus)}
                            </h2>
                        </div>
                        {isBuying && order.orderStatus === 'DELIVERY_COMPLETED' && (

                            <button
                                onClick={handleComplete}
                                disabled={isCompleting}
                                className="bg-accent text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-accent/20 transition-all hover:bg-[#4a58b0] hover:-translate-y-0.5 disabled:opacity-50"
                            >
                                {isCompleting ? '처리 중...' : '구매 확정'}
                            </button>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <h3 className="text-lg font-bold text-[#333] mb-6 flex items-center gap-2">
                            <Package size={20} className="text-gray-400" />
                            상품 정보
                        </h3>
                        <div className="flex gap-6 items-center">
                            <div className="w-32 h-32 bg-gray-50 rounded-2xl border border-gray-100 p-4 flex-shrink-0">
                                <img
                                    src={order.thumbnailImage || `https://placehold.co/200x200/png?text=${order.productName?.split(' ')[0] || 'Order'}`}
                                    alt={order.productName}
                                    className="w-full h-full object-contain mix-blend-multiply"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-400 mb-1">{order.brandName}</p>
                                <h4 className="text-xl font-bold text-[#333] mb-2">{order.productName}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                    <span>사이즈: {order.productSize}</span>
                                    <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                                    <span>모델번호: {order.productNumber}</span>
                                </div>
                                <div className="mt-4 text-2xl font-black text-[#333]">
                                    {order.price.toLocaleString()}원
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Shipping Info */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                            <h3 className="text-lg font-bold text-[#333] mb-6 flex items-center gap-2">
                                <Truck size={20} className="text-gray-400" />
                                배송지 정보
                            </h3>
                            <div className="flex gap-4">
                                <MapPin size={20} className="text-gray-300 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600 leading-relaxed">
                                        {order.address || '등록된 배송지 정보가 없습니다.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                            <h3 className="text-lg font-bold text-[#333] mb-6 flex items-center gap-2">
                                <CreditCard size={20} className="text-gray-400" />
                                결제 정보
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400 font-bold">결제 일시</span>
                                    <span className="text-sm text-[#333] font-medium">
                                        {order.paymentDate ? new Date(order.paymentDate).toLocaleString() : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400 font-bold">주문 번호</span>
                                    <span className="text-sm text-[#333] font-medium">#{order.orderId}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                                    <span className="text-base font-bold text-[#333]">총 결제 금액</span>
                                    <span className="text-xl font-black text-accent">{order.price.toLocaleString()}원</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Guidelines */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex gap-3 items-start">
                            <AlertCircle size={18} className="text-gray-400 mt-0.5" />
                            <div className="text-xs text-gray-500 leading-relaxed font-medium">
                                <p className="mb-2 font-bold text-gray-600">안내 사항</p>
                                <ul className="space-y-1 list-disc pl-4">
                                    <li>구매 확정 후에는 취소 및 반품이 불가능합니다.</li>
                                    <li>상품 수령 후 전문가의 검수가 완료된 정품입니다.</li>
                                    <li>배송 관련 문의는 1:1 문의를 이용해 주세요.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
