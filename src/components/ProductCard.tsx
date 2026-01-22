import './ProductCard.css';
import { Heart } from 'lucide-react';

interface ProductCardProps {
    id: string;
    brand: string;
    name: string;
    price: number;
    imageUrl: string;
    tags?: string[];
}

export const ProductCard = ({ brand, name, price, imageUrl, tags }: ProductCardProps) => {
    return (
        <div className="product-card">
            <div className="product-image-container">
                <img src={imageUrl} alt={name} className="product-image" />
                <button className="wishlist-btn">
                    <Heart size={18} color="#333" />
                </button>
            </div>
            <div className="product-info">
                <h4 className="product-brand">{brand}</h4>
                <p className="product-name">{name}</p>
                {tags && tags.length > 0 && (
                    <div className="product-tags">
                        {tags.map(tag => (
                            <span key={tag} className="product-tag">{tag}</span>
                        ))}
                    </div>
                )}
                <div className="product-price">
                    <span className="price-amount">{price.toLocaleString()}원</span>
                    <span className="price-label">즉시 구매가</span>
                </div>
            </div>
        </div>
    );
};
