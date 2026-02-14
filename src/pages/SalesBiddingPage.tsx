import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getProductDetail } from '../api/product';
import { getSellNowPrice, getBuyNowPrice } from '../api/market';
import { ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';
import type { ProductDetailResponse, ProductOption } from '../types/product';

// 사이즈 값 추출 헬퍼 함수
const getSizeFromOptions = (options: ProductOption[]): string => {
    const sizeOption = options.find(opt => opt.groupName === '사이즈');
    return sizeOption?.value || 'N/A';
};

export const SalesBiddingPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const size = searchParams.get('size');

    const [product, setProduct] = useState<ProductDetailResponse['product'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [mode, setMode] = useState<'bid' | 'sell'>('bid');
    const [bidPrice, setBidPrice] = useState<string>('');
    const [immediatePrice, setImmediatePrice] = useState<number | null>(null);
    const [immediateBuyPrice, setImmediateBuyPrice] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const productVariant = product?.products.find(p => getSizeFromOptions(p.options) === size);
    const productId = productVariant?.productId;

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) {
                setError("상품 ID가 없습니다.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const productData = await getProductDetail(Number(id));
                setProduct(productData.product);

                const variant = productData.product.products.find(p => getSizeFromOptions(p.options) === size);
                if (variant) {
                    const [sellRes, buyRes] = await Promise.all([
                        getSellNowPrice(variant.productId).catch(() => null),
                        getBuyNowPrice(variant.productId).catch(() => null)
                    ]);

                    const sellNowPrice = sellRes?.data?.sellNowPrice || null;
                    setImmediatePrice(sellNowPrice);
                    if (sellNowPrice) {
                        setMode('sell');
                    }
                    setImmediateBuyPrice(buyRes?.data?.buyNowPrice || null);
                }

            } catch (err) {
                setError("상품 정보를 불러오는 데 실패했습니다.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [id, size]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setBidPrice(value);
    };

    const handleSubmit = async () => {
        if (!productId) {
            alert('상품 옵션 정보(productId)가 올바르지 않습니다.');
            return;
        }

        setIsSubmitting(true);
        const finalPrice = mode === 'sell' ? immediatePrice : parseInt(bidPrice);

        if (!finalPrice || finalPrice <= 0) {
            alert('금액을 확인해 주세요.');
            setIsSubmitting(false);
            return;
        }

        if (mode === 'bid' && finalPrice % 1000 !== 0) {
            alert('입찰가는 1,000원 단위로 입력해 주세요.');
            setIsSubmitting(false);
            return;
        }

        const isBid = mode === 'bid';
        navigate(`/checkout/${id}?size=${size}&price=${finalPrice}&type=판매&isBid=${isBid}`);
        setIsSubmitting(false);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin" /></div>;
    }

    if (error || !product || !size) {
        return <div className="pt-32 text-center text-red-500">{error || "상품 정보를 찾을 수 없습니다."}</div>;
    }

    const parsedPrice = bidPrice ? parseInt(bidPrice) : 0;
    const displayPrice = mode === 'sell' ? (immediatePrice || 0) : parsedPrice;
    const totalAmount = displayPrice; // Fees are calculated on the next page

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-[80px] pb-20 px-4 font-pretendard">
            <div className="max-w-[780px] mx-auto bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden mt-8">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-black text-[#333]">{mode === 'sell' ? '즉시 판매하기' : '판매 입찰하기'}</h1>
                    <div className="w-10" />
                </div>

                <div className="p-8">
                    <div className="flex gap-6 items-center p-6 bg-white rounded-2xl mb-8 border border-gray-100 shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden p-2">
                            <img src={productVariant?.imageUrls[0] || product.products[0]?.imageUrls[0] || ''} alt={product.productInfo.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <h2 className="text-base font-bold text-gray-900 leading-tight">{product.productInfo.name}</h2>
                            <p className="text-xs text-gray-400 font-medium">{product.productInfo.brand.name} • {product.productInfo.code}</p>
                            <span className="mt-1 text-sm font-black text-gray-900">{size}</span>
                        </div>
                    </div>

                    <div className="flex gap-px bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden mb-8">
                        <div className="bg-white flex-1 flex flex-col items-center py-6 border-r border-gray-100">
                            <span className="text-[11px] font-bold text-gray-400 mb-1">즉시 판매가</span>
                            <span className="text-lg font-black text-gray-900">
                                {immediatePrice ? `${immediatePrice.toLocaleString()}원` : '-'}
                            </span>
                        </div>
                        <div className="bg-white flex-1 flex flex-col items-center py-6">
                            <span className="text-[11px] font-bold text-gray-400 mb-1">즉시 구매가</span>
                            <span className="text-lg font-black text-gray-900">
                                {immediateBuyPrice ? `${immediateBuyPrice.toLocaleString()}원` : '-'}
                            </span>
                        </div>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-2xl mb-10">
                        <button
                            onClick={() => setMode('bid')}
                            className={`flex-1 py-4 rounded-xl text-sm font-bold transition-all ${mode === 'bid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            판매 입찰
                        </button>
                        <button
                            onClick={() => immediatePrice && setMode('sell')}
                            disabled={!immediatePrice}
                            className={`flex-1 py-4 rounded-xl text-sm font-bold transition-all ${mode === 'sell' ? 'bg-[#222] text-white shadow-sm' : 'text-gray-400'} ${!immediatePrice && 'opacity-50 cursor-not-allowed'}`}
                        >
                            즉시 판매
                        </button>
                    </div>

                    <div className="mb-10 min-h-[140px]">
                        {mode === 'bid' ? (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <label className="text-sm font-bold text-gray-900 flex justify-between items-center ml-1">
                                    <span>판매 희망가</span>
                                    <span className="text-[11px] text-gray-400 font-medium">최근 거래가: -</span>
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={bidPrice ? parseInt(bidPrice).toLocaleString() : ''}
                                        onChange={handlePriceChange}
                                        placeholder="희망가 입력"
                                        className="w-full h-16 pr-14 pl-6 text-xl font-black text-right border-b-2 border-gray-100 focus:border-gray-900 outline-none transition-all placeholder:text-gray-200"
                                    />
                                    <span className="absolute right-0 top-0 h-full flex items-center text-xl font-black text-[#333] pointer-events-none pr-6">원</span>
                                </div>
                                <p className="text-[11px] text-gray-400 font-medium ml-1 flex items-start gap-1.5">
                                    <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                                    희망가에 도달하면 즉시 거래가 체결됩니다.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="flex justify-between items-end border-b-2 border-gray-900 pb-4">
                                    <span className="text-sm font-bold text-gray-900">즉시 판매가</span>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 font-bold mb-1">주의! 최근 거래가를 확인해주세요.</p>
                                        <span className="text-2xl font-black text-gray-900">{totalAmount.toLocaleString()}원</span>
                                    </div>
                                </div>
                                <p className="text-[12px] text-gray-400 font-medium leading-relaxed">
                                    정산 예정 금액은 다음 화면에서 계산됩니다. 즉시 판매 시 구매자가 등록한 가격으로 즉시 체결됩니다.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-8 border-t border-gray-100 mb-12">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 font-medium">정산 예정 금액</span>
                            <span className="text-gray-900 font-bold">다음 화면에서 확인</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-100">
                            <span className="text-base font-black text-gray-900">정산 예정 금액</span>
                            <div className="flex flex-col items-end">
                                <span className="text-3xl font-black text-gray-900">{totalAmount ? `${totalAmount.toLocaleString()}원` : '-'}</span>
                                <span className="text-[10px] text-gray-400">거래 체결 시 카카오페이머니로 정산됩니다.</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={(mode === 'bid' && !bidPrice) || (mode === 'sell' && !immediatePrice) || isSubmitting}
                        className={`w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-black/10 transition-all active:scale-[0.98] flex items-center justify-center
                            ${((mode === 'bid' && !bidPrice) || (mode === 'sell' && !immediatePrice) || isSubmitting)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-[#222] text-white hover:bg-[#333]'}`}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : (mode === 'sell' ? '즉시 판매 계속' : '판매 입찰 등록')}
                    </button>
                </div>
            </div>
        </div>
    );
};
