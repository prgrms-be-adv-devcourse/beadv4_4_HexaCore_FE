import { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';

// Mock Data
const DROPPED_PRODUCTS = [
    { id: '1', brand: 'Nike', name: 'Nike Air Jordan 1 Retro High OG Chicago', price: 450000, imageUrl: 'https://placehold.co/400x400/png?text=Jordan+1+Chicago' },
    { id: '2', brand: 'Adidas', name: 'Adidas Yeezy Boost 350 V2 Zebra', price: 380000, imageUrl: 'https://placehold.co/400x400/png?text=Yeezy+350' },
    { id: '3', brand: 'Supreme', name: 'Supreme Box Logo Hoodie Black', price: 850000, imageUrl: 'https://placehold.co/400x400/png?text=Supreme+Box+Logo' },
    { id: '4', brand: 'New Balance', name: 'New Balance 2002R Protection Pack Grey', price: 180000, imageUrl: 'https://placehold.co/400x400/png?text=NB+2002R' },
    { id: '5', brand: 'Stussy', name: 'Stussy World Tour Tee White', price: 65000, imageUrl: 'https://placehold.co/400x400/png?text=Stussy' },
    { id: '6', brand: 'Sony', name: 'Sony WH-1000XM5 Silver', price: 399000, imageUrl: 'https://placehold.co/400x400/png?text=Sony+XM5' },
    { id: '7', brand: 'Apple', name: 'Apple AirPods Max Sky Blue', price: 720000, imageUrl: 'https://placehold.co/400x400/png?text=AirPods+Max' },
    { id: '8', brand: 'Arc\'teryx', name: 'Arc\'teryx Beta LT Jacket Black', price: 650000, imageUrl: 'https://placehold.co/400x400/png?text=Arcteryx' },
];

const CATEGORIES = ["전체", "스니커즈", "의류", "액세서리", "컬렉터블"];

export const Home = () => {
    const [activeCategory, setActiveCategory] = useState("전체");

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Hero Section */}
            <section className="relative flex h-[600px] flex-col items-center justify-center pt-[60px] text-center bg-gradient-to-tr from-[#e8eaf6] via-[#9fa8da] to-[#5c6bc0] overflow-hidden">
                {/* Decorative Circles */}
                <div className="absolute -top-[100px] -left-[100px] h-[600px] w-[600px] rounded-full bg-white/10" />
                <div className="absolute -bottom-[50px] right-[10%] h-[400px] w-[400px] rounded-full bg-white/10" />

                <div className="relative z-10 w-full max-w-[800px] px-5">
                    <h1 className="mb-5 text-5xl font-extrabold leading-tight text-white drop-shadow-md md:text-6xl">
                        한정판 거래의 새로운 기준
                    </h1>
                    <p className="mb-12 text-xl font-medium text-white/90">
                        안전하고 투명한 입찰 시스템으로 원하는 가격에 거래하세요
                    </p>

                    <SearchBar maxWidth="600px" />
                </div>
            </section>

            {/* Category Navigation */}
            <div className="sticky top-[70px] z-[50] border-b border-[#eee] bg-white py-4">
                <ul className="flex justify-center gap-4 m-0 p-0 list-none">
                    {CATEGORIES.map(cat => (
                        <li key={cat}>
                            <button
                                className={`rounded-[20px] border border-solid px-5 py-2 text-sm transition-all duration-200 cursor-pointer
                                    ${activeCategory === cat
                                        ? 'bg-white border-[#5c6bc0]/40 text-[#333] font-bold shadow-[0_2px_8px_rgba(92,107,192,0.2)] -translate-y-[0.5px]'
                                        : 'bg-white border-gray-200 text-[#888] hover:border-gray-300 hover:text-[#333]'
                                    }`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Product Section */}
            <section className="mx-auto max-w-[1500px] px-10 py-8">
                <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
                    <h3 className="text-2xl font-bold text-[#333]">인기 상품</h3>
                    <span className="text-sm text-[#888]">{DROPPED_PRODUCTS.length}개 상품</span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,250px)] justify-center gap-5">
                    {DROPPED_PRODUCTS.map(product => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </section>
        </div>
    );
};
