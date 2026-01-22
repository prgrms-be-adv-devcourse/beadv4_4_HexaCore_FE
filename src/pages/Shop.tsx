import { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Search } from 'lucide-react';
import './Shop.css';
import '../pages/Home.css'; // Reuse Home structure styles

const SHOP_PRODUCTS = [
    { id: '1', brand: 'Nike', name: 'Nike Air Force 1 \'07 White', price: 139000, imageUrl: 'https://placehold.co/400x400/png?text=Air+Force+1' },
    { id: '2', brand: 'Adidas', name: 'Adidas Samba OG Cloud White', price: 150000, imageUrl: 'https://placehold.co/400x400/png?text=Samba' },
    { id: '3', brand: 'Supreme', name: 'Supreme Box Logo Hoodie', price: 500000, imageUrl: 'https://placehold.co/400x400/png?text=Supreme' },
    { id: '4', brand: 'New Balance', name: 'New Balance 530 Steel Grey', price: 129000, imageUrl: 'https://placehold.co/400x400/png?text=NB+530' },
    { id: '5', brand: 'Nike', name: 'Nike Dunk Low Retro Black White', price: 129000, imageUrl: 'https://placehold.co/400x400/png?text=Dunk+Low' },
    { id: '6', brand: 'Jordan', name: 'Jordan 1 Retro High OG', price: 239000, imageUrl: 'https://placehold.co/400x400/png?text=Jordan+1' },
    { id: '7', brand: 'Stussy', name: 'Stussy World Tour Tee', price: 68000, imageUrl: 'https://placehold.co/400x400/png?text=Stussy' },
    { id: '8', brand: 'Apple', name: 'AirPods Max Silver', price: 769000, imageUrl: 'https://placehold.co/400x400/png?text=AirPods' },
];

const CATEGORIES = ["전체", "스니커즈", "의류", "액세서리", "컬렉터블"];

export const Shop = () => {
    const [activeCategory, setActiveCategory] = useState("전체");
    const [activeBrand, setActiveBrand] = useState("전체 브랜드");

    return (
        <div className="home-page"> {/* Reuse home-page class for spacing */}
            {/* Search Section */}
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
                <section className="section-container product-section">
                    <div className="section-header">
                        <h3>전체 상품</h3>
                        <span className="section-count">{SHOP_PRODUCTS.length}개 상품</span>
                    </div>
                    <div className="product-grid">
                        {SHOP_PRODUCTS.map(product => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};
