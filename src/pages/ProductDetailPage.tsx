import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useWishlistStore } from '../store/useWishlistStore';
import { SHOP_PRODUCTS } from '../data/mockData';
import { useCartStore } from '../store/cartStore';
import { getBuyNowPrice, getSellNowPrice } from '../api/market';
import { Heart, Truck, CheckCircle, Share2, Info, ChevronLeft, ChevronRight, ShoppingCart, X } from 'lucide-react';

const SIZE_OPTIONS = ["230", "240", "250", "260", "270", "280", "290"];

export const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const product = SHOP_PRODUCTS.find(p => p.id === id);
    const { toggleWishlist, wishlistIds } = useWishlistStore();
    const { addItem } = useCartStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    // 사이즈별 가격 정보를 저장하는 상태로 변경
    const [allPrices, setAllPrices] = useState<{ [size: string]: { buyNow: number | null, sellNow: number | null } }>({});
    const [modalMode, setModalMode] = useState<'buy' | 'sell' | null>(null);

    const images = product?.images || [product?.imageUrl || ''];

    useEffect(() => {
        window.scrollTo(0, 0);
        setCurrentIndex(0);
        setSelectedSize(null);

        const fetchAllSizePrices = async () => {
            if (!product?.sizeIds) return;

            try {
                const sizeEntries = Object.entries(product.sizeIds).filter(([_, sId]) => sId && sId !== undefined);
                const results = await Promise.all(
                    sizeEntries.map(async ([size, sId]) => {
                        try {
                            const [buyRes, sellRes] = await Promise.all([
                                getBuyNowPrice(Number(sId)).catch(() => ({ data: null })),
                                getSellNowPrice(Number(sId)).catch(() => ({ data: null }))
                            ]);
                            return {
                                size,
                                buyNow: buyRes?.data?.buyNowPrice || null,
                                sellNow: sellRes?.data?.sellNowPrice || null
                            };
                        } catch {
                            return { size, buyNow: null, sellNow: null };
                        }
                    })
                );

                const priceMap: { [size: string]: { buyNow: number | null, sellNow: number | null } } = {};
                results.forEach(res => {
                    priceMap[res.size] = { buyNow: res.buyNow, sellNow: res.sellNow };
                });
                setAllPrices(priceMap);
            } catch (error) {
                console.error("Failed to fetch all size prices:", error);
            }
        };

        fetchAllSizePrices();
    }, [id, product]);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const isWishlisted = id ? wishlistIds.includes(id) : false;

    const handleToggleWishlist = () => {
        if (id) toggleWishlist(id);
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            setModalMode('buy');
            return;
        }
        executeAddToCart(selectedSize);
    };

    const executeAddToCart = (size: string) => {
        if (product) {
            const sizePrice = allPrices[size];
            addItem({
                id: `${product.id}-${size}`,
                brand: product.brand,
                name: product.name,
                price: (modalMode === 'sell' ? sizePrice?.sellNow : sizePrice?.buyNow) || product.price,
                imageUrl: product.imageUrl,
                size: size
            });
            setShowToast(true);
            setModalMode(null);
            setSelectedSize(null);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] font-pretendard">
                <div className="text-center p-12 bg-white rounded-3xl border border-solid border-gray-100 shadow-sm">
                    <Info size={48} className="mx-auto mb-4 text-gray-300" />
                    <h2 className="text-2xl font-bold text-[#333] mb-4">상품을 찾을 수 없습니다.</h2>
                    <Link to="/shop" className="text-accent font-bold hover:underline">Shop으로 돌아가기</Link>
                </div>
            </div>
        );
    }

    // 유효한 즉시 구매가(buyNow, 즉 판매 입찰 중 가장 낮은 가격)들을 추출
    const validBuyPrices = Object.values(allPrices).map(p => p.buyNow).filter((p): p is number => p !== null);

    // 즉시 구매가 중 가장 낮은 가격을 대표가로 설정
    const representativePrice = validBuyPrices.length > 0
        ? Math.min(...validBuyPrices)
        : null;

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-[100px] pb-32 px-6 lg:px-10 font-pretendard">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
                    {/* Left Side: Product Image Gallery (Fixed Height) */}
                    <div className="w-full lg:flex-1 lg:sticky lg:top-[120px]">
                        <div className="relative aspect-square bg-white rounded-3xl overflow-hidden border border-solid border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] group">
                            {/* Main Display Area */}
                            <div className="w-full h-full flex items-center justify-center p-12 lg:p-20 bg-[#F9F9F9]">
                                <img
                                    src={images[currentIndex]}
                                    alt={product.name}
                                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-multiply"
                                />
                            </div>

                            {/* Image Counter Badge */}
                            {images.length > 1 && (
                                <div className="absolute top-6 right-6 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-white text-[10px] font-bold tracking-widest z-30 transition-opacity group-hover:bg-black/70">
                                    {currentIndex + 1} / {images.length}
                                </div>
                            )}

                            {/* Navigation Arrows */}
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

                            {/* Dot Indicators */}
                            {images.length > 1 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === idx ? 'bg-accent w-6' : 'bg-gray-300 w-1.5'}`}
                                            aria-label={`Go to image ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            )}

                            <button className="absolute top-6 left-6 p-3 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-accent transition-colors z-20">
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Product Info & Actions */}
                    <div className="w-full lg:flex-1 flex flex-col pt-4">
                        <div className="mb-10">
                            <Link to={`/shop?brand=${product.brand}`} className="inline-block text-lg font-black text-[#333] border-b-2 border-solid border-[#333] mb-4 hover:opacity-70 transition-opacity">
                                {product.brand}
                            </Link>
                            <h1 className="text-2xl lg:text-3xl font-medium text-[#333] mb-8 leading-tight tracking-tight">
                                {product.name}
                            </h1>

                            {/* Product Info Table (Based on Backend Spec) */}
                            <div className="grid grid-cols-3 border-y border-gray-100 py-5 gap-4">
                                <div className="flex flex-col gap-1 border-r border-gray-100 pr-4">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">모델번호</span>
                                    <span className="text-xs font-black text-[#333]">{product.code}</span>
                                </div>
                                <div className="flex flex-col gap-1 border-r border-gray-100 px-4">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">발매일</span>
                                    <span className="text-xs font-black text-[#333]">{product.releaseDate}</span>
                                </div>
                                <div className="flex flex-col gap-1 pl-4">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">발매가</span>
                                    <span className="text-xs font-black text-[#333]">{product.releasePrice.toLocaleString()}원</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 border border-solid border-gray-100 shadow-sm mb-8">
                            <div className="flex flex-col mb-8 gap-0.5">
                                <span className="text-[12px] font-bold text-gray-400">발매가 {product.releasePrice.toLocaleString()}원</span>
                                <div className="flex items-end gap-1">
                                    <strong className="text-3xl font-black text-accent">
                                        {representativePrice !== null ? representativePrice.toLocaleString() : ' - '}
                                    </strong>
                                    {representativePrice !== null && <span className="text-xl font-bold text-accent mb-1">원</span>}
                                </div>
                            </div>

                            {/* Delivery Info Section Simplified - Improved Alignment */}
                            <div className="flex items-center py-5 border-t border-gray-100 mb-2">
                                <span className="w-20 text-[13px] text-gray-400 font-medium">배송비</span>
                                <span className="text-[13px] font-bold text-[#333]">일반배송 무료</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <button
                                    onClick={() => setModalMode('buy')}
                                    className="flex flex-col items-center justify-center gap-1 h-[70px] rounded-xl bg-[#222] text-white shadow-lg shadow-black/5 transition-all hover:bg-[#333] hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <span className="text-lg font-black tracking-tight">구매하기</span>
                                    {/* <span className="text-[10px] font-bold opacity-70">즉시 구매가</span> */}
                                </button>
                                <button
                                    onClick={() => setModalMode('sell')}
                                    className="flex flex-col items-center justify-center gap-1 h-[70px] rounded-xl bg-accent text-white shadow-lg shadow-accent/20 transition-all hover:bg-[#4a58b0] hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <span className="text-lg font-black tracking-tight">판매하기</span>
                                    {/* <span className="text-[10px] font-bold opacity-70">즉시 판매가</span> */}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <button
                                    className="w-full h-14 rounded-xl border border-solid border-gray-200 bg-white flex items-center justify-center gap-2 transition-all font-bold text-[#333] hover:border-gray-300 active:scale-[0.99]"
                                    onClick={handleToggleWishlist}
                                >
                                    <Heart
                                        size={20}
                                        className={isWishlisted ? "text-red-500 fill-red-500" : "text-gray-300"}
                                    />
                                    <span>{isWishlisted ? "관심 상품" : "관심 등록"}</span>
                                </button>
                                <button
                                    className="w-full h-14 rounded-xl border border-solid border-gray-200 bg-white flex items-center justify-center gap-2 transition-all font-bold text-[#333] hover:border-gray-300 active:scale-[0.99]"
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingCart size={20} className="text-gray-400" />
                                    <span>장바구니 담기</span>
                                </button>
                            </div>
                        </div>

                        {/* Premium Size Selection Modal */}
                        {modalMode && (
                            <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-300" onClick={() => { setModalMode(null); setSelectedSize(null); }}>
                                <div
                                    className="bg-white w-full max-w-[480px] rounded-t-[32px] sm:rounded-[32px] overflow-hidden animate-in slide-in-from-bottom duration-500 shadow-2xl flex flex-col max-h-[90vh]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Modal Header */}
                                    <div className="p-6 border-b border-gray-50 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <h3 className="text-xl font-bold text-[#333]">{modalMode === 'buy' ? '구매하기' : '판매하기'}</h3>
                                                <span className="text-[11px] text-gray-400 font-medium">(가격 단위: 원)</span>
                                            </div>
                                            <button onClick={() => { setModalMode(null); setSelectedSize(null); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 -mr-2">
                                                <X size={24} />
                                            </button>
                                        </div>

                                        {/* Product Summary In Modal */}
                                        <div className="flex gap-4 items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                            <div className="w-16 h-16 bg-white rounded-xl overflow-hidden p-1 flex-shrink-0 border border-gray-100">
                                                <img src={product.imageUrl} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{modalMode === 'buy' ? 'BUYING' : 'SELLING'}</span>
                                                <span className="text-sm font-bold text-gray-900 truncate">{product.name}</span>
                                                <span className="text-[11px] text-gray-500 truncate">{product.brand} • {product.code}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Body: Size Grid */}
                                    <div className="p-6 pb-2 overflow-y-auto scrollbar-hide">
                                        <div className="grid grid-cols-3 gap-3">
                                            {SIZE_OPTIONS.map(size => {
                                                const sizePrice = allPrices[size];
                                                const displayPrice = modalMode === 'buy' ? sizePrice?.buyNow : sizePrice?.sellNow;

                                                return (
                                                    <button
                                                        key={size}
                                                        onClick={() => setSelectedSize(size)}
                                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border border-solid transition-all group
                                                            ${selectedSize === size
                                                                ? 'border-gray-900 bg-white ring-2 ring-gray-900 ring-inset shadow-md'
                                                                : 'border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50'}
                                                        `}
                                                    >
                                                        <span className={`text-[15px] font-bold ${selectedSize === size ? 'text-gray-900' : 'text-[#333]'}`}>
                                                            {size}
                                                        </span>
                                                        <span className={`text-[10px] font-bold mt-1 
                                                            ${displayPrice ? (modalMode === 'buy' ? 'text-red-500' : 'text-green-600') : 'text-gray-300'}`}
                                                        >
                                                            {displayPrice ? `${displayPrice.toLocaleString()}` : (modalMode === 'buy' ? '구매입찰' : '판매입찰')}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Modal Footer: Action Buttons (Only visible when size is selected) */}
                                    <div className={`p-6 border-t border-gray-100 transition-all duration-300 bg-white ${selectedSize ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none absolute bottom-0 left-0 right-0'}`}>
                                        <div className="space-y-4">
                                            {selectedSize && (() => {
                                                const sizePrice = allPrices[selectedSize];
                                                const displayPrice = modalMode === 'buy' ? sizePrice?.buyNow : sizePrice?.sellNow;

                                                if (displayPrice) {
                                                    return (
                                                        <>
                                                            {/* Delivery Info (Static) */}
                                                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-bold text-gray-900">일반배송</span>
                                                                    <span className="text-xs text-gray-400">5-7일 내 도착 예정</span>
                                                                </div>
                                                                <span className="text-sm font-extrabold text-gray-900">
                                                                    {displayPrice.toLocaleString()}원
                                                                </span>
                                                            </div>

                                                            {/* Action Buttons Swapped & Equal Sized */}
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        const targetPath = modalMode === 'buy' ? 'bid' : 'sell';
                                                                        navigate(`/products/${id}/${targetPath}?size=${selectedSize}`);
                                                                        setModalMode(null);
                                                                        setSelectedSize(null);
                                                                    }}
                                                                    className={`flex-1 h-14 text-white rounded-xl font-bold text-sm transition-colors ${modalMode === 'buy' ? 'bg-[#ff4f4f] hover:bg-[#ff3535]' : 'bg-[#41b979] hover:bg-[#38a56b]'}`}
                                                                >
                                                                    {modalMode === 'buy' ? '즉시 구매하기' : '즉시 판매하기'}
                                                                </button>
                                                                <button
                                                                    onClick={() => executeAddToCart(selectedSize!)}
                                                                    className="flex-1 h-14 bg-[#222] text-white rounded-xl font-bold text-sm hover:bg-[#333] transition-colors"
                                                                >
                                                                    장바구니 담기
                                                                </button>
                                                            </div>
                                                        </>
                                                    );
                                                } else {
                                                    return (
                                                        <div className="flex flex-col items-center gap-6 py-2">
                                                            <div className="text-center space-y-1">
                                                                <p className="text-[13px] font-bold text-gray-400">
                                                                    즉시 {modalMode === 'buy' ? '구매' : '판매'} 가능한 상품이 없습니다.
                                                                </p>
                                                                <p className="text-[13px] font-bold text-gray-400">
                                                                    {modalMode === 'buy' ? '구매' : '판매'} 입찰로 희망가에 거래해 보세요!
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    const targetPath = modalMode === 'buy' ? 'bid' : 'sell';
                                                                    navigate(`/products/${id}/${targetPath}?size=${selectedSize}`);
                                                                    setModalMode(null);
                                                                    setSelectedSize(null);
                                                                }}
                                                                className={`w-full h-14 text-white rounded-xl font-bold text-base transition-colors ${modalMode === 'buy' ? 'bg-[#ff4f4f] hover:bg-[#ff3535]' : 'bg-[#41b979] hover:bg-[#38a56b]'}`}
                                                            >
                                                                {modalMode === 'buy' ? '구매 입찰하기' : '판매 입찰하기'}
                                                            </button>
                                                        </div>
                                                    );
                                                }
                                            })()}
                                        </div>
                                    </div>

                                    {!selectedSize && (
                                        <div className="bg-gray-50 p-6 text-center border-t border-gray-100 mt-auto">
                                            <p className="text-xs text-gray-400 font-medium">사이즈를 선택하면 다음 단계로 진행됩니다.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Success Toast */}
                        {showToast && (
                            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[3000] bg-gray-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 font-bold text-sm">
                                <CheckCircle size={18} className="text-green-400" />
                                <span>장바구니에 상품을 담았습니다.</span>
                                <Link to="/cart" className="ml-4 text-accent hover:underline">장바구니 이동</Link>
                            </div>
                        )}

                        <div className="space-y-6 pt-6 border-t border-solid border-gray-100">
                            <h4 className="text-sm font-black text-[#333] uppercase lg:text-base">배송 정보</h4>
                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border border-solid border-gray-100 flex-shrink-0">
                                        <Truck size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#333] mb-1">배송비 무료</p>
                                        <p className="text-xs font-medium text-gray-400 leading-relaxed">
                                            전문 검수팀의 꼼꼼한 검수를 거친 후,<br />
                                            체계적인 배송 시스템을 통해 안전하게 배송됩니다.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border border-solid border-gray-100 flex-shrink-0">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#333] mb-1">100% 정품 보증</p>
                                        <p className="text-xs font-medium text-gray-400 leading-relaxed">
                                            RESELLO 검수센터에서 철저한 검토를 거쳐 합격한<br />
                                            정품만을 취급하며, 가품 시 3배 보상을 약속드립니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
