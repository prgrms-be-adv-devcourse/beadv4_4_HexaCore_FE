import { useParams, Link } from 'react-router-dom';
import { SHOP_PRODUCTS } from '../data/mockData';
import { Heart, Truck, CheckCircle } from 'lucide-react';
import './ProductDetailPage.css';

export const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const product = SHOP_PRODUCTS.find(p => p.id === id);

    if (!product) {
        return (
            <div className="product-not-found">
                <h2>상품을 찾을 수 없습니다.</h2>
                <Link to="/shop">Shop으로 돌아가기</Link>
            </div>
        );
    }

    return (
        <div className="product-detail-container">
            <div className="product-detail-left">
                <div className="product-detail-image-wrapper">
                    <img src={product.imageUrl} alt={product.name} className="product-detail-image" />
                </div>
            </div>

            <div className="product-detail-right">
                <div className="product-info-header">
                    <a href="#" className="detail-brand-name">{product.brand}</a>
                    <h1 className="detail-product-name">{product.name}</h1>
                    <p className="detail-product-name-ko">{product.name} (한글명 없음)</p> {/* Mock data doesn't have KO name */}
                </div>

                <div className="detail-price-section">
                    <span className="detail-price-label">최근 거래가</span>
                    <strong className="detail-price-amount">{product.price.toLocaleString()}<span className="detail-price-unit">원</span></strong>
                </div>

                <div className="product-actions">
                    <button className="action-btn buy">
                        구매
                        <span className="action-sub-text">즉시 구매가</span>
                    </button>
                    <button className="action-btn sell">
                        판매
                        <span className="action-sub-text">즉시 판매가</span>
                    </button>
                </div>

                <button className="wishlist-btn-large">
                    <Heart size={20} />
                    <span>관심상품</span>
                </button>

                <div className="delivery-info">
                    <div className="delivery-item">
                        <div className="delivery-icon">
                            <Truck size={20} />
                        </div>
                        <div className="delivery-text">
                            <p className="delivery-title">무료배송</p>
                            <p className="delivery-desc">모든 상품 무료 배송 (이벤트 기간)</p>
                        </div>
                    </div>
                    <div className="delivery-item">
                        <div className="delivery-icon">
                            <CheckCircle size={20} />
                        </div>
                        <div className="delivery-text">
                            <p className="delivery-title">정품 보증</p>
                            <p className="delivery-desc">KREAM 검수센터에서 검수 후 배송</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
