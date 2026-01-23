import { useWishlistStore } from '../store/useWishlistStore';
import { ProductCard } from '../components/ProductCard';
import { SHOP_PRODUCTS } from '../data/mockData';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SavedPage = () => {
    const { wishlistIds } = useWishlistStore();
    const savedProducts = SHOP_PRODUCTS.filter(product => wishlistIds.includes(product.id));

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 px-6 lg:px-10 font-pretendard">
            <div className="max-w-[1200px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <Heart className="text-[#333]" size={28} />
                        <h2 className="text-3xl font-black text-[#333] tracking-tight">관심 상품</h2>
                    </div>
                    <p className="text-gray-400 font-medium ml-[40px]">관심 상품 목록 ({savedProducts.length}건)</p>
                </div>

                {savedProducts.length > 0 ? (
                    <div className="grid grid-cols-[repeat(auto-fill,250px)] justify-center gap-x-6 gap-y-12">
                        {savedProducts.map(product => (
                            <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <ProductCard {...product} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-solid border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
                            <Heart size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-[#333] mb-2">저장한 상품이 없습니다.</h3>
                        <p className="text-gray-400 mb-8 font-medium">마음에 드는 상품을 찾아 하트를 눌러보세요!</p>
                        <Link
                            to="/shop"
                            className="flex items-center gap-2 bg-accent text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-accent/20 transition-all hover:bg-[#4a58b0] hover:-translate-y-0.5"
                        >
                            <ShoppingBag size={18} />
                            쇼핑하러 가기
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
