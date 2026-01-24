import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { SHOP_PRODUCTS } from '../data/mockData';
import { registerSellBid, getSellNowPrice } from '../api/market';
import { ChevronLeft, Info, AlertCircle } from 'lucide-react';

export const SalesBiddingPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const size = searchParams.get('size');
    const product = SHOP_PRODUCTS.find(p => p.id === id);
    const sizeId = product?.sizeIds?.[size || ''];

    const [bidPrice, setBidPrice] = useState<string>('');
    const [immediatePrice, setImmediatePrice] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (sizeId) {
            getSellNowPrice(sizeId).then(res => {
                setImmediatePrice(res?.data?.sellNowPrice || null);
            });
        }
    }, [sizeId]);

    if (!product || !size) {
        return <div className="pt-32 text-center">상품 정보를 찾을 수 없습니다.</div>;
    }

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setBidPrice(value);
    };

    const handleSubmit = async () => {
        console.log('Attempting to register sales bid:', { sizeId, bidPrice });

        if (!sizeId) {
            alert('상품 옵션 정보(sizeId)가 올바르지 않습니다.');
            return;
        }
        if (!bidPrice) {
            alert('금액을 입력해 주세요.');
            return;
        }

        if (parseInt(bidPrice) % 1000 !== 0) {
            alert('입찰가는 1,000원 단위로 입력해 주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            await registerSellBid(sizeId, parseInt(bidPrice), size);
            alert('판매 입찰이 성공적으로 등록되었습니다.');
            navigate(`/products/${id}`);
        } catch (error: any) {
            console.error('Failed to register bid:', error);
            const errorMsg = error.response?.data?.message || '입찰 등록에 실패했습니다. 상품 정보와 보증금을 확인해 주세요.';
            alert(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const parsedPrice = bidPrice ? parseInt(bidPrice) : 0;
    const commissionFee = 0; // 현재는 0원 (이벤트 등)
    const totalAmount = parsedPrice - commissionFee; // 정산 예정 금액

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-[80px] pb-20 px-4 font-pretendard">
            <div className="max-w-[780px] mx-auto bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden mt-8">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-black text-[#333]">판매 입찰하기</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                <div className="p-8">
                    {/* Product Summary */}
                    <div className="flex gap-6 items-center p-6 bg-gray-50 rounded-2xl mb-10 border border-gray-100">
                        <div className="w-24 h-24 bg-white rounded-xl overflow-hidden p-2 border border-gray-100 shadow-sm">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">SELL BIDDING</span>
                            <h2 className="text-lg font-bold text-gray-900 truncate leading-tight">{product.name}</h2>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-[#41b979] text-white text-[10px] font-bold rounded-sm">{size}</span>
                                <span className="text-xs text-gray-400 font-medium">{product.brand} • {product.code}</span>
                            </div>
                        </div>
                    </div>

                    {/* Price Comparison */}
                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="flex flex-col items-center py-4 rounded-xl border border-gray-50 bg-[#FAFAFA]">
                            <span className="text-[11px] font-bold text-gray-400 mb-1">즉시 판매가</span>
                            <span className="text-base font-black text-gray-900">
                                {immediatePrice ? `${immediatePrice.toLocaleString()}원` : '-'}
                            </span>
                        </div>
                        <div className="flex flex-col items-center py-4 rounded-xl border border-gray-50 bg-[#FAFAFA]">
                            <span className="text-[11px] font-bold text-gray-400 mb-1">즉시 구매가</span>
                            <span className="text-base font-black text-gray-400">조회 불가</span>
                        </div>
                    </div>

                    {/* Bid Price Input */}
                    <div className="mb-10 space-y-4">
                        <label className="text-sm font-bold text-gray-900 flex items-center gap-1.5 ml-1">
                            판매 희망가
                            <Info size={14} className="text-gray-300" />
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={bidPrice ? parsedPrice.toLocaleString() : ''}
                                onChange={handlePriceChange}
                                placeholder="희망가 입력"
                                className="w-full h-16 px-6 text-xl font-black text-right border-b-2 border-gray-100 focus:border-[#41b979] outline-none transition-all placeholder:text-gray-200"
                            />
                            <span className="absolute right-0 bottom-4 text-xl font-black text-[#333] pointer-events-none pr-6">원</span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium ml-1 flex items-start gap-1.5">
                            <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                            판매 희망가에 도달하면 즉시 거래가 체결됩니다. 허위 입찰 방지를 위해 보증금이 결제될 수 있습니다.
                        </p>
                    </div>

                    {/* Settlement Summary */}
                    <div className="space-y-4 pt-8 border-t border-gray-100 mb-12">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 font-medium">판매 수수료</span>
                            <span className="text-gray-900 font-bold">무료 이벤트</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 font-medium">배송비</span>
                            <span className="text-gray-900 font-bold">선불 (판매자 부담)</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-100">
                            <span className="text-base font-black text-gray-900">정산 예정 금액</span>
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-black text-[#41b979]">{totalAmount.toLocaleString()}원</span>
                                <span className="text-[10px] text-gray-400">거래 체결 시 카카오페이머니로 정산됩니다.</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!bidPrice || isSubmitting}
                        className={`w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-green-500/10 transition-all active:scale-[0.98] flex items-center justify-center
                            ${(!bidPrice || isSubmitting)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-[#41b979] hover:bg-[#38a56b] text-white'}`}
                    >
                        {isSubmitting ? '입찰 처리 중...' : '판매 입찰 등록'}
                    </button>
                </div>
            </div>
        </div>
    );
};
