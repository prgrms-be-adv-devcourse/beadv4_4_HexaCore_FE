import { useState } from 'react';
import './Cart.css';
import { X } from 'lucide-react';

interface CartItem {
    id: string;
    brand: string;
    name: string;
    size: string;
    price: number;
    imageUrl: string;
    selected: boolean;
}

const INITIAL_CART_ITEMS: CartItem[] = [
    {
        id: '1',
        brand: 'Nike',
        name: 'Nike Air Jordan 1 Retro High OG Chicago',
        size: '270',
        price: 450000,
        imageUrl: 'https://placehold.co/400x400/png?text=Jordan+1+Chicago',
        selected: true
    },
    {
        id: '2',
        brand: 'Supreme',
        name: 'Supreme Box Logo Hoodie Black',
        size: 'L',
        price: 850000,
        imageUrl: 'https://placehold.co/400x400/png?text=Supreme+Box+Logo',
        selected: true
    },
];

export const Cart = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);

    const toggleSelect = (id: string) => {
        setCartItems(prev => prev.map(item =>
            item.id === id ? { ...item, selected: !item.selected } : item
        ));
    };

    const removeItem = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const selectedItems = cartItems.filter(item => item.selected);
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="cart-page">
            <h2 className="cart-title">장바구니</h2>

            <div className="cart-content">
                <div className="cart-items">
                    {cartItems.map(item => (
                        <div key={item.id} className="cart-item">
                            <div className="cart-checkbox">
                                <input
                                    type="checkbox"
                                    checked={item.selected}
                                    onChange={() => toggleSelect(item.id)}
                                />
                            </div>
                            <div className="cart-item-image">
                                <img src={item.imageUrl} alt={item.name} />
                            </div>
                            <div className="cart-item-info">
                                <div className="brand">{item.brand}</div>
                                <div className="name">{item.name}</div>
                                <div className="size">사이즈: {item.size}</div>
                                <div className="price">{item.price.toLocaleString()}원</div>
                            </div>
                            <button className="remove-btn" onClick={() => removeItem(item.id)}>
                                <X size={20} />
                            </button>
                        </div>
                    ))}
                    {cartItems.length === 0 && (
                        <div className="empty-cart">
                            장바구니에 담긴 상품이 없습니다.
                        </div>
                    )}
                </div>

                <div className="cart-summary">
                    <h3>주문 요약</h3>
                    <div className="summary-row">
                        <span>선택 상품</span>
                        <span>{selectedItems.length}개</span>
                    </div>
                    <div className="summary-row">
                        <span>상품 금액</span>
                        <span>{totalAmount.toLocaleString()}원</span>
                    </div>
                    <div className="summary-row">
                        <span>배송비</span>
                        <span>무료</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-total">
                        <span>총 결제금액</span>
                        <span className="total-price">{totalAmount.toLocaleString()}원</span>
                    </div>
                    <button className="checkout-btn">
                        구매 입찰하기
                    </button>
                    <p className="summary-note">구매 입찰 시 배송비가 차감됩니다</p>
                </div>
            </div>
        </div>
    );
};
