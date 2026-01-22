import { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import './Home.css';
import { Search } from 'lucide-react';

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
    const [activeBrand, setActiveBrand] = useState("전체 브랜드");

    return (
        <div className="home-page">
            {/* Search Section (Replaces Hero) */}
            <div className="search-section">
                <div className="search-container-wide">
                    <input
                        type="text"
                        className="wide-search-input"
                        placeholder="브랜드, 상품명으로 검색"
                    />
                    <button className="wide-search-btn">
                        <Search size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="main-layout">
                {/* Left Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-section">
                        <h3 className="sidebar-title">브랜드</h3>
                        <ul className="sidebar-list">
                            <li>
                                <button
                                    className={`sidebar-brand-btn ${activeBrand === "전체 브랜드" ? 'active' : ''}`}
                                    onClick={() => setActiveBrand("전체 브랜드")}
                                >
                                    전체 브랜드
                                </button>
                            </li>
                            {["Nike", "Adidas", "Supreme", "New Balance", "Stussy", "Kaws", "The North Face"].map(brand => (
                                <li key={brand}>
                                    <button
                                        className={`sidebar-brand-btn ${activeBrand === brand ? 'active' : ''}`}
                                        onClick={() => setActiveBrand(brand)}
                                    >
                                        {brand}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="sidebar-section">
                        <h3 className="sidebar-title">카테고리</h3>
                        <ul className="sidebar-list">
                            {CATEGORIES.map(cat => (
                                <li key={cat}>
                                    <button
                                        className={`sidebar-cat-btn ${activeCategory === cat ? 'active' : ''}`}
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
                <section className="section-container">
                    <div className="section-header">
                        <h3>인기 상품</h3>
                        <span className="section-count">{DROPPED_PRODUCTS.length}개 상품</span>
                    </div>
                    <div className="product-grid">
                        {DROPPED_PRODUCTS.map(product => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};
