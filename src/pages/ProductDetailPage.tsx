import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/cartStore';
import { getProductDetail } from '../api/product';
import { getBuyNowPrice, getSellNowPrice } from '../api/market';
import {
    Heart,
    Share2,
    ChevronLeft,
    ChevronRight,
    X,
    Loader2,
    AlertCircle,
    CheckCircle,
    Bell
} from 'lucide-react';
import type { ProductDetailResponse, ProductResponse, ProductOption } from '../types/product';
import { savePriceAlert } from '../api/priceAlert';

// 사이즈 값 추출 헬퍼 함수
const getSizeFromOptions = (options: ProductOption[]): string => {
    const sizeOption = options.find(opt => opt.groupName === '사이즈');
    return sizeOption?.value || 'N/A';
};

export const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [product, setProduct] = useState<ProductDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { toggleWishlist, wishlistIds } = useWishlistStore();
    const { addItem } = useCartStore();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

    const [allPrices, setAllPrices] = useState<{
        [size: string]: { buyNow: number | null, sellNow: number | null }
    }>({});
    const [modalMode, setModalMode] = useState<'buy' | 'sell' | 'alert' | null>(null);
    const [targetPrice, setTargetPrice] = useState<string>('');

    const placeholderImage = "https://via.placeholder.com/600x600?text=No+Image";
    const images = product?.products?.[0]?.imageUrls || [];
    const mainImage = images[currentIndex] || placeholderImage;

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!id) return;

        const fetchProduct = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getProductDetail(Number(id));
                setProduct(data);
                if (data.products) {
                    fetchPricesForAllSizes(data.products);
                }
            } catch (err) {
                setError("상품 정보를 불러오는 데 실패했습니다.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const fetchPricesForAllSizes = async (products: ProductResponse[]) => {
        try {
            const pricePromises = products.map(async (p) => {
                const size = getSizeFromOptions(p.options);
                if (size === 'N/A') return null;

                try {
                    const [buyRes, sellRes] = await Promise.all([
                        getBuyNowPrice(p.productId).catch(() => ({ data: null })),
                        getSellNowPrice(p.productId).catch(() => ({ data: null }))
                    ]);
                    return {
                        size,
                        buyNow: buyRes?.data?.buyNowPrice || null,
                        sellNow: sellRes?.data?.sellNowPrice || null
                    };
                } catch {
                    return { size, buyNow: null, sellNow: null };
                }
            });

            const results = await Promise.all(pricePromises);
            const priceMap: {
                [size: string]: { buyNow: number | null, sellNow: number | null }
            } = {};

            results.forEach(res => {
                if (res) priceMap[res.size] = { buyNow: res.buyNow, sellNow: res.sellNow };
            });
            setAllPrices(priceMap);
        } catch (error) {
            console.error("Failed to fetch all size prices:", error);
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (images.length > 0) {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (images.length > 0) {
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    const isWishlisted = id ? wishlistIds.includes(id) : false;

    const handleToggleWishlist = () => {
        if (id) toggleWishlist(id);
    };

    const executeAddToCart = (size: string) => {
        if (product && product.productInfo) {
            const selectedProductVariant = product.products.find(p => getSizeFromOptions(p.options) === size);
            if (!selectedProductVariant) return;

            const sizePrice = allPrices[size];
            const price = (modalMode === 'sell' ? sizePrice?.sellNow : sizePrice?.buyNow) || product.productInfo.releasePrice;

            addItem({
                id: `${product.productInfo.productInfoId}-${size}`,
                brand: product.productInfo.brand.name,
                name: product.productInfo.name,
                price: price,
                imageUrl: selectedProductVariant.imageUrls?.[0] || placeholderImage,
                size: size
            });
            setShowToast(true);
            setModalMode(null);
            setSelectedSize(null);
            setTargetPrice('');
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-accent" />
            </div>
        );
    }

    if (error || !product || !product.productInfo) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] font-pretendard">
                <div className="text-center p-12 bg-white rounded-3xl border border-solid border-gray-100 shadow-sm">
                    <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
                    <h2 className="text-2xl font-bold text-[#333] mb-4">{error || '상품을 찾을 수 없습니다.'}</h2>
                    <Link to="/shop" className="text-accent font-bold hover:underline">Shop으로 돌아가기</Link>
                </div>
            </div>
        );
    }

    const { productInfo } = product;

    const availableSizes = product.products
        .map(p => getSizeFromOptions(p.options))
        .filter(s => s !== 'N/A')
        .sort((a, b) => {
            const aNum = Number(a);
            const bNum = Number(b);
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            if (!isNaN(aNum)) return -1;
            if (!isNaN(bNum)) return 1;
            return a.localeCompare(b);
        });

    const validBuyPrices = Object.values(allPrices)
        .map(p => p.buyNow)
        .filter((p): p is number => p !== null);

    const representativePrice = validBuyPrices.length > 0 ? Math.min(...validBuyPrices) : null;

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-[100px] pb-32 px-6 lg:px-10 font-pretendard">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
                    {/* Left: Image */}
                    <div className="w-full lg:flex-1 lg:sticky lg:top-[120px]">
                        <div className="relative aspect-square bg-white rounded-3xl overflow-hidden border border-solid border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] group">
                            <div className="w-full h-full flex items-center justify-center p-4 lg:p-20 bg-[#F9F9F9]">
                                <img
                                    src={mainImage}
                                    alt={productInfo.name}
                                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                                />
                            </div>

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrev}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/80 backdrop-blur-md rounded-full text-[#333] opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-lg active:scale-90 z-40"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-white/80 backdrop-blur-md rounded-full text-[#333] opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-lg active:scale-90 z-40"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}
                            <button className="absolute top-6 left-6 p-3 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-accent transition-colors z-20">
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="w-full lg:flex-1 flex flex-col pt-4">
                        <div className="mb-10">
                            <Link
                                to={`/shop?brand=${productInfo.brand.brandId}`}
                                className="inline-block text-lg font-black text-[#333] border-b-2 border-solid border-[#333] mb-4 hover:opacity-70 transition-opacity"
                            >
                                {productInfo.brand.name}
                            </Link>
                            <h1 className="text-2xl lg:text-3xl font-medium text-[#333] mb-8 leading-tight tracking-tight">
                                {productInfo.name}
                            </h1>

                            <div className="grid grid-cols-3 border-y border-gray-100 py-5 gap-4">
                                <div className="flex flex-col gap-1 border-r border-gray-100 pr-4">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">모델번호</span>
                                    <span className="text-xs font-black text-[#333]">{productInfo.code}</span>
                                </div>
                                <div className="flex flex-col gap-1 border-r border-gray-100 px-4">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">발매일</span>
                                    <span className="text-xs font-black text-[#333]">
                                        {new Date(productInfo.releaseDate).toLocaleDateString("ko-KR")}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 pl-4">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">발매가</span>
                                    <span className="text-xs font-black text-[#333]">
                                        {productInfo.releasePrice.toLocaleString()}원
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 border border-solid border-gray-100 shadow-sm mb-8">
                            <div className="flex flex-col mb-8 gap-0.5">
                                <span className="text-[12px] font-bold text-gray-400">즉시 구매가</span>
                                <div className="flex items-end gap-1">
                                    <strong className="text-3xl font-black text-accent">
                                        {representativePrice !== null ? representativePrice.toLocaleString() : ' - '}
                                    </strong>
                                    {representativePrice !== null && <span className="text-xl font-bold text-accent mb-1">원</span>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <button
                                    onClick={() => setModalMode('buy')}
                                    className="flex flex-col items-center justify-center gap-1 h-[70px] rounded-xl bg-[#222] text-white shadow-lg shadow-black/5 transition-all hover:bg-[#333] hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <span className="text-lg font-black tracking-tight">구매하기</span>
                                </button>
                                <button
                                    onClick={() => setModalMode('sell')}
                                    className="flex flex-col items-center justify-center gap-1 h-[70px] rounded-xl bg-accent text-white shadow-lg shadow-accent/20 transition-all hover:bg-[#4a58b0] hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <span className="text-lg font-black tracking-tight">판매하기</span>
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 h-14 rounded-xl border border-solid border-gray-200 bg-white flex items-center justify-center gap-2 transition-all font-bold text-[#333] hover:border-gray-300 active:scale-[0.99]"
                                    onClick={handleToggleWishlist}
                                >
                                    <Heart size={20} className={isWishlisted ? "text-red-500 fill-red-500" : "text-gray-300"} />
                                    <span>{isWishlisted ? "관심 상품" : "관심 등록"}</span>
                                </button>
                                <button
                                    className="w-14 h-14 rounded-xl border border-solid border-gray-200 bg-white flex items-center justify-center transition-all text-[#333] hover:border-gray-300 active:scale-[0.99]"
                                    onClick={() => setModalMode('alert')}
                                >
                                    <Bell size={20} />
                                </button>
                            </div>
                        </div>

                        {modalMode && (
                            <div
                                className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-300"
                                onClick={() => { setModalMode(null); setSelectedSize(null); setTargetPrice(''); }}
                            >
                                <div
                                    className="bg-white w-full max-w-[480px] rounded-t-[32px] sm:rounded-[32px] overflow-hidden animate-in slide-in-from-bottom duration-500 shadow-2xl flex flex-col max-h-[90vh]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="p-6 border-b border-gray-50 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <h3 className="text-xl font-bold text-[#333]">
                                                    {modalMode === 'buy' ? '구매하기' : modalMode === 'sell' ? '판매하기' : '가격 알림 설정'}
                                                </h3>
                                                <span className="text-[11px] text-gray-400 font-medium">(가격 단위: 원)</span>
                                            </div>
                                            <button
                                                onClick={() => { setModalMode(null); setSelectedSize(null); setTargetPrice(''); }}
                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 -mr-2"
                                            >
                                                <X size={24} />
                                            </button>
                                        </div>
                                        <div className="flex gap-4 items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                            <div className="w-16 h-16 bg-white rounded-xl overflow-hidden p-1 flex-shrink-0 border border-gray-100">
                                                <img src={mainImage} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                                    {modalMode === 'buy' ? 'BUYING' : modalMode === 'sell' ? 'SELLING' : 'PRICE ALERT'}
                                                </span>
                                                <span className="text-sm font-bold text-gray-900 truncate">{productInfo.name}</span>
                                                <span className="text-[11px] text-gray-500 truncate">{productInfo.brand.name} • {productInfo.code}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 pb-2 overflow-y-auto scrollbar-hide">
                                        <div className="grid grid-cols-3 gap-3">
                                            {availableSizes.map(size => {
                                                const sizePrice = allPrices[size];
                                                const displayPrice = modalMode === 'buy' ? sizePrice?.buyNow : modalMode === 'sell' ? sizePrice?.sellNow : sizePrice?.buyNow;
                                                const productVariant = product.products.find(p => getSizeFromOptions(p.options) === size);

                                                return (
                                                    <button
                                                        key={size}
                                                        onClick={() => setSelectedSize(size)}
                                                        disabled={!productVariant}
                                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border border-solid transition-all group ${!productVariant
                                                            ? 'bg-gray-50 cursor-not-allowed'
                                                            : selectedSize === size
                                                                ? 'border-gray-900 bg-white ring-2 ring-gray-900 ring-inset shadow-md'
                                                                : 'border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <span className={`text-[15px] font-bold ${!productVariant
                                                            ? 'text-gray-300'
                                                            : selectedSize === size
                                                                ? 'text-gray-900'
                                                                : 'text-[#333]'
                                                            }`}>
                                                            {size}
                                                        </span>
                                                        <span className={`text-[10px] font-bold mt-1 ${!productVariant
                                                            ? 'text-gray-300'
                                                            : displayPrice
                                                                ? (modalMode === 'buy' || modalMode === 'alert' ? 'text-red-500' : 'text-green-600')
                                                                : 'text-gray-300'
                                                            }`}>
                                                            {productVariant
                                                                ? (displayPrice ? `${displayPrice.toLocaleString()}` : (modalMode === 'buy' || modalMode === 'alert' ? '구매입찰' : '판매입찰'))
                                                                : '-'}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {selectedSize && (
                                        <div className="p-6 border-t border-gray-100 bg-white">
                                            {modalMode === 'alert' ? (
                                                <div className="flex flex-col gap-3">
                                                    <input
                                                        type="number"
                                                        value={targetPrice}
                                                        onChange={(e) => setTargetPrice(e.target.value)}
                                                        placeholder="알림 받을 가격을 입력하세요"
                                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 outline-none focus:border-black font-bold text-lg"
                                                    />
                                                    <button
                                                        onClick={async () => {
                                                            if (!targetPrice) return;
                                                            const selectedProduct = product.products.find(p => getSizeFromOptions(p.options) === selectedSize);
                                                            if (selectedProduct) {
                                                                try {
                                                                    await savePriceAlert({
                                                                        targetPrice: Number(targetPrice),
                                                                        productId: selectedProduct.productId
                                                                    });
                                                                    alert('가격 알림이 설정되었습니다.');
                                                                    setModalMode(null);
                                                                    setSelectedSize(null);
                                                                    setTargetPrice('');
                                                                } catch (e) {
                                                                    alert('가격 알림 설정에 실패했습니다.');
                                                                }
                                                            }
                                                        }}
                                                        className="w-full h-14 rounded-xl bg-black text-white font-bold text-lg"
                                                    >
                                                        알림 설정하기
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        const selectedProduct = product.products.find(p => getSizeFromOptions(p.options) === selectedSize);
                                                        if (selectedProduct) {
                                                            navigate(`/${modalMode === 'buy' ? 'purchase' : 'sales'}/${selectedProduct.productId}`);
                                                        }
                                                    }}
                                                    className="w-full h-14 rounded-xl bg-accent text-white font-bold text-lg"
                                                >
                                                    {allPrices[selectedSize] && (modalMode === 'buy' ? allPrices[selectedSize]?.buyNow : allPrices[selectedSize]?.sellNow)
                                                        ? '즉시주문 계속'
                                                        : '입찰 계속'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {showToast && (
                            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[3000] bg-gray-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 font-bold text-sm">
                                <CheckCircle size={18} className="text-green-400" />
                                <span>장바구니에 상품을 담았습니다.</span>
                                <Link to="/cart" className="ml-4 text-accent hover:underline">장바구니 이동</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};