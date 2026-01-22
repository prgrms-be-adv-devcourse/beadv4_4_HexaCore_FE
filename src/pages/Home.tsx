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

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        한정판 거래의 새로운 기준
                    </h1>
                    <p className="hero-subtitle">
                        안전하고 투명한 입찰 시스템으로 원하는 가격에 거래하세요
                    </p>

                    <div className="hero-search-container">
                        <input
                            type="text"
                            className="hero-search-input"
                            placeholder="브랜드, 상품명으로 검색"
                        />
                        <button className="search-btn">
                            <Search size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Category Navigation */}
            <div className="category-nav">
                <ul className="category-list">
                    {CATEGORIES.map(cat => (
                        <li key={cat} className="category-item">
                            <button
                                className={activeCategory === cat ? 'active' : ''}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

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
    );
};
