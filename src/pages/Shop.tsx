import { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Search } from 'lucide-react';

import { SHOP_PRODUCTS } from '../data/mockData';

const CATEGORIES = ["전체", "스니커즈", "의류", "액세서리", "컬렉터블"];

export const Shop = () => {
    const [activeCategory, setActiveCategory] = useState("전체");
    const [activeBrand, setActiveBrand] = useState("전체 브랜드");

    return (
        <div className="min-h-screen bg-white">
            {/* Search Section */}
            <div className="pt-[100px] pb-10 bg-white border-b border-[#f0f0f0]">
                <div className="relative flex items-center max-w-[800px] mx-auto px-5">
                    <input
                        type="text"
                        className="w-full py-4 pr-[60px] pl-6 text-base border-2 border-[#eee] rounded-[50px] bg-[#f9f9f9] outline-none transition-all duration-200 focus:border-[#333] focus:bg-white font-pretendard"
                        placeholder="브랜드, 상품명으로 검색"
                    />
                    <button className="absolute right-7 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white border-none cursor-pointer">
                        <Search size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="flex w-full gap-10 py-8 px-16 max-md:flex-col max-md:px-5">
                {/* Left Sidebar */}
                <aside className="flex w-[260px] flex-shrink-0 flex-col gap-10 max-md:w-full">
                    <div className="mb-10">
                        <h3 className="mb-4 text-base font-bold text-black font-pretendard">브랜드</h3>
                        <ul className="flex flex-col gap-1 list-none p-0 m-0">
                            <li>
                                <button
                                    className={`w-full py-2.5 px-4 text-left text-[0.95rem] transition-all duration-200 rounded-[4px] cursor-pointer font-pretendard
                                        ${activeBrand === "전체 브랜드"
                                            ? 'bg-accent text-white font-bold shadow-[0_4px_10px_rgba(92,107,192,0.3)]'
                                            : 'bg-transparent text-[#555] hover:bg-[#e8eaf6] hover:text-[#5c6bc0]'}`}
                                    onClick={() => setActiveBrand("전체 브랜드")}
                                >
                                    전체 브랜드
                                </button>
                            </li>
                            {["Nike", "Adidas", "Supreme", "New Balance", "Stussy", "Kaws", "The North Face"].map(brand => (
                                <li key={brand}>
                                    <button
                                        className={`w-full py-2.5 px-4 text-left text-[0.95rem] transition-all duration-200 rounded-[4px] cursor-pointer font-pretendard
                                            ${activeBrand === brand
                                                ? 'bg-accent text-white font-bold shadow-[0_4px_10px_rgba(92,107,192,0.3)]'
                                                : 'bg-transparent text-[#555] hover:bg-[#e8eaf6] hover:text-[#5c6bc0]'}`}
                                        onClick={() => setActiveBrand(brand)}
                                    >
                                        {brand}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-10">
                        <h3 className="mb-4 text-base font-bold text-black font-pretendard">카테고리</h3>
                        <ul className="flex flex-col gap-1 list-none p-0 m-0">
                            {CATEGORIES.map(cat => (
                                <li key={cat}>
                                    <button
                                        className={`w-full py-2.5 px-4 text-left text-[0.95rem] transition-all duration-200 rounded-[4px] cursor-pointer font-pretendard
                                            ${activeCategory === cat
                                                ? 'bg-accent text-white font-bold shadow-[0_4px_10px_rgba(92,107,192,0.3)]'
                                                : 'bg-transparent text-[#555] hover:bg-[#e8eaf6] hover:text-[#5c6bc0]'}`}
                                        onClick={() => setActiveCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Product Section */}
                <section className="flex-1 px-5">
                    <div className="mb-8 flex items-center justify-between border-b border-gray-400 pb-4">
                        <h3 className="text-2xl font-bold text-[#333] font-pretendard">전체 상품</h3>
                        <span className="text-sm text-[#888] font-pretendard">{SHOP_PRODUCTS.length}개 상품</span>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,250px)] justify-center gap-5">
                        {SHOP_PRODUCTS.map(product => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};
