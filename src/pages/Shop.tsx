import { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { SHOP_PRODUCTS } from '../data/mockData';

const CATEGORIES = ["전체", "스니커즈", "의류", "액세서리", "컬렉터블"];

export const Shop = () => {
    const [activeCategory, setActiveCategory] = useState("전체");
    const [activeBrand, setActiveBrand] = useState("전체 브랜드");
    const [isBrandExpanded, setIsBrandExpanded] = useState(false);
    const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);

    return (
        <div className="min-h-screen bg-white">
            {/* Search Section */}
            <div className="pt-[100px] pb-10 bg-white border-b border-[#f0f0f0]">
                <SearchBar />
            </div>

            {/* Main Content Layout */}
            <div className="flex w-full gap-10 py-8 px-16 max-md:flex-col max-md:px-5">
                {/* Left Sidebar */}
                <aside className="flex w-[260px] flex-shrink-0 flex-col gap-6 max-md:w-full max-md:gap-2">
                    {/* Brand Filter */}
                    <div className="border-b border-gray-100 pb-4 max-md:border-none max-md:pb-0">
                        <button
                            className="flex w-full items-center justify-between py-2 text-left md:pointer-events-none md:mb-4"
                            onClick={() => setIsBrandExpanded(!isBrandExpanded)}
                        >
                            <h3 className="text-base font-bold text-black font-pretendard">브랜드</h3>
                            <div className="md:hidden">
                                {isBrandExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </button>
                        <ul className={`flex flex-col gap-1 list-none p-0 m-0 overflow-hidden transition-all duration-300 ${isBrandExpanded ? 'max-md:max-h-[500px] max-md:opacity-100 max-md:mt-2' : 'max-md:max-h-0 max-md:opacity-0'}`}>
                            <li>
                                <button
                                    className={`w-full py-2.5 px-4 text-left text-[0.9rem] transition-all duration-200 rounded-lg cursor-pointer font-pretendard
                                        ${activeBrand === "전체 브랜드"
                                            ? 'bg-accent/10 text-accent font-bold'
                                            : 'bg-transparent text-[#555] hover:bg-gray-50 hover:text-[#333]'}`}
                                    onClick={() => setActiveBrand("전체 브랜드")}
                                >
                                    전체 브랜드
                                </button>
                            </li>
                            {["Nike", "Adidas", "Supreme", "New Balance", "Stussy", "Kaws", "The North Face"].map(brand => (
                                <li key={brand}>
                                    <button
                                        className={`w-full py-2.5 px-4 text-left text-[0.9rem] transition-all duration-200 rounded-lg cursor-pointer font-pretendard
                                            ${activeBrand === brand
                                                ? 'bg-accent/10 text-accent font-bold'
                                                : 'bg-transparent text-[#555] hover:bg-gray-50 hover:text-[#333]'}`}
                                        onClick={() => setActiveBrand(brand)}
                                    >
                                        {brand}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Category Filter */}
                    <div className="border-b border-gray-100 pb-4 max-md:border-none max-md:pb-0">
                        <button
                            className="flex w-full items-center justify-between py-2 text-left md:pointer-events-none md:mb-4"
                            onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                        >
                            <h3 className="text-base font-bold text-black font-pretendard">카테고리</h3>
                            <div className="md:hidden">
                                {isCategoryExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </button>
                        <ul className={`flex flex-col gap-1 list-none p-0 m-0 overflow-hidden transition-all duration-300 ${isCategoryExpanded ? 'max-md:max-h-[500px] max-md:opacity-100 max-md:mt-2' : 'max-md:max-h-0 max-md:opacity-0'}`}>
                            {CATEGORIES.map(cat => (
                                <li key={cat}>
                                    <button
                                        className={`w-full py-2.5 px-4 text-left text-[0.9rem] transition-all duration-200 rounded-lg cursor-pointer font-pretendard
                                            ${activeCategory === cat
                                                ? 'bg-accent/10 text-accent font-bold'
                                                : 'bg-transparent text-[#555] hover:bg-gray-50 hover:text-[#333]'}`}
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
                    <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
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
