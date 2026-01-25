import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getProductDetail } from '../api/product';
import { registerBuyBid, registerSellBid, buyNow, sellNow } from '../api/market';
import { ChevronRight, ChevronLeft, Info, Building2, Loader2, AlertCircle } from 'lucide-react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import type { ProductDetailResponse, ProductOption } from '../types/product';

// 사이즈 값 추출 헬퍼 함수
const getSizeFromOptions = (options: ProductOption[]): string => {
    const sizeOption = options.find(opt => opt.groupName === '사이즈');
    return sizeOption?.value || 'N/A';
};

const TOSS_CLIENT_KEY = 'test_ck_d46qopOB89Zv9qOnB0gL3ZmM75y0';

export const CheckoutPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState<ProductDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const size = searchParams.get('size');
    const price = searchParams.get('price');
    const type = searchParams.get('type') || '구매'; // '구매' 또는 '판매'
    const isBid = searchParams.get('isBid') === 'true';
    const isSelling = type === '판매';

    const productVariant = product?.products.find(p => getSizeFromOptions(p.options) === size);
    const productId = productVariant?.productId;

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!id) {
            setError("상품 ID가 없습니다.");
            setIsLoading(false);
            return;
        }
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const data = await getProductDetail(Number(id));
                setProduct(data);
            } catch (err) {
                setError("상품 정보를 불러오는 데 실패했습니다.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);


    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin" /></div>;
    }

    if (error || !product || !size || !price) {
        return <div className="pt-32 text-center text-red-500">{error || "주문 정보를 불러올 수 없습니다."}</div>;
    }

    const itemPrice = parseInt(price || '0');
    const deliveryFee = isSelling ? 0 : 3000;
    const finalAmount = isSelling ? itemPrice : itemPrice + deliveryFee;

    const handleFinalAction = async () => {
        if (!productId) {
            alert('상품 옵션 정보(productId)가 올바르지 않습니다.');
            return;
        }

        setIsSubmitting(true);
        try {
            let apiCall;
            if (isSelling) {
                apiCall = isBid ? registerSellBid : sellNow;
            } else {
                apiCall = isBid ? registerBuyBid : buyNow;
            }

            const res = await apiCall(Number(productId), itemPrice, size);
            const data = res.data;

            if (data.status === 'PAID' || isSelling) {
                alert(isBid ? `${type} 입찰이 등록되었습니다.` : `${type}가 완료되었습니다.`);
                navigate(`/products/${id}`);
            } else if (data.status === 'REQUIRES_PG') {
                const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
                await tossPayments.requestPayment('카드', {
                    amount: data.pgRequiredAmount,
                    orderId: data.tossOrderId,
                    orderName: `${product.productInfo.name} (${size}) ${isBid ? '입찰' : '구매'}`,
                    successUrl: `${window.location.origin}/payment/success?isBid=${isBid}&type=${type}`,
                    failUrl: `${window.location.origin}/payment/fail?isBid=${isBid}&type=${type}`,
                    customerEmail: data.customerEmail || '',
                    customerName: data.customerName || '고객',
                });
            }
        } catch (error: any) {
            console.error('Action failed:', error);
            const errorMsg = error.response?.data?.message || '처리에 실패했습니다.';
            alert(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F4F4] pt-[80px] pb-24 px-4 font-pretendard">
            <div className="max-w-[700px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 px-2">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-3 text-gray-400 hover:text-gray-900 transition-colors">
                        <ChevronLeft size={28} />
                    </button>
                    <h1 className="text-xl font-black text-gray-900">
                        {isBid ? (isSelling ? '판매 입찰 확인' : '구매 입찰 확인') : (isSelling ? '즉시 판매 확인' : '즉시 구매 확인')}
                    </h1>
                    <button className="text-xs font-bold text-gray-400 border border-gray-300 px-3 py-1.5 rounded-lg bg-white">검수기준</button>
                </div>

                <div className="space-y-3">
                    {/* Address Section */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-base font-black text-gray-900 mb-6">{isSelling ? '반송 주소' : '배송 주소'}</h3>
                        <div className="space-y-2 mb-6">
                            <div className="flex text-sm"><span className="w-24 text-gray-400 font-medium">받는 분</span><span className="font-bold text-gray-900">테스터</span></div>
                            <div className="flex text-sm"><span className="w-24 text-gray-400 font-medium">연락처</span><span className="font-medium text-gray-900">010-1234-5678</span></div>
                            <div className="flex text-sm">
                                <span className="w-24 text-gray-400 font-medium">주소</span>
                                <span className="font-medium text-gray-900 flex-1 leading-relaxed">[12345] 서울특별시 강남구 테헤란로 427...</span>
                            </div>
                        </div>
                    </section>

                    {/* Product Summary */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-base font-black text-gray-900 mb-6">상품 정보</h3>
                        <div className="flex gap-4 p-4 bg-gray-50/50 rounded-2xl">
                            <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl overflow-hidden p-2">
                                <img src={productVariant?.imageUrls[0] || product.products[0]?.imageUrls[0] || ''} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 truncate mb-0.5">{product.productInfo.name}</h4>
                                <div className="flex justify-between items-end mt-auto">
                                    <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded-sm uppercase">{size} / {isBid ? '입찰' : '즉시'}</span>
                                    <span className="text-base font-black text-gray-900">{itemPrice.toLocaleString()}원</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {isBid && !isSelling && (
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 italic">
                            <div className="flex items-start gap-3 text-gray-500">
                                <Info size={18} className="mt-0.5" />
                                <p className="text-xs leading-relaxed font-medium">
                                    입찰은 30일 동안 유지됩니다. 거래가 체결되면 등록하신 배송 주소와 결제 수단으로 자동 주문됩니다.
                                </p>
                            </div>
                        </section>
                    )}

                    {!isSelling && (
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-base font-black text-gray-900 mb-6 font-pretendard">결제 방법</h3>
                            <button className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-900 bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>
                                    <span className="text-sm font-bold text-gray-900">카드 간편결제</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-400" />
                            </button>
                        </section>
                    )}

                    {isSelling && (
                        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-base font-black text-gray-900 mb-6">정산 계좌</h3>
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
                                <Building2 className="text-gray-400" size={20} />
                                <div><div className="text-sm font-bold text-gray-900">코드은행</div><div className="text-xs font-medium text-gray-400 leading-none mt-1">123-456*** (테스터)</div></div>
                            </div>
                        </section>
                    )}

                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-base font-black text-gray-900 mb-6">{isBid ? '입찰 확인' : '최종 확인'}</h3>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm"><span className="text-gray-400 font-medium">{isBid ? '입찰가' : (isSelling ? '즉시 판매가' : '즉시 구매가')}</span><span className="font-bold text-gray-900">{itemPrice.toLocaleString()}원</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-400 font-medium">{isSelling ? '판매 수수료' : '배송비'}</span><span className="font-bold text-gray-900">{isSelling ? '무료' : deliveryFee.toLocaleString() + '원'}</span></div>
                            <div className="flex justify-between pt-4 border-t border-gray-50 items-end">
                                <span className="text-base font-black text-gray-900 font-pretendard">{isSelling ? '예상 정산 금액' : (isBid ? '총 결제 금액' : '최종 결제 금액')}</span>
                                <span className={`text-2xl font-black ${isSelling ? 'text-[#41b979]' : 'text-gray-900'}`}>{finalAmount.toLocaleString()}원</span>
                            </div>
                        </div>
                        <button
                            onClick={handleFinalAction}
                            disabled={isSubmitting}
                            className="w-full h-16 bg-[#222] text-white rounded-2xl font-black text-lg shadow-xl shadow-black/10 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {isSubmitting ? '처리 중...' : (isBid ? `${type} 입찰하기` : '결제하기')}
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
};
