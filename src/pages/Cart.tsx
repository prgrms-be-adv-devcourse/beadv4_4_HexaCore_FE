import { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';

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

    const toggleSelectAll = () => {
        const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected);
        setCartItems(prev => prev.map(item => ({ ...item, selected: !allSelected })));
    };

    const removeItem = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const removeSelectedItems = () => {
        setCartItems(prev => prev.filter(item => !item.selected));
    };

    const selectedItems = cartItems.filter(item => item.selected);
    const productAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);
    const commission = selectedItems.length > 0 ? Math.floor(productAmount * 0.03 / 100) * 100 : 0; // 3% 수수료
    const totalAmount = productAmount + commission;

    const isAllSelected = cartItems.length > 0 && cartItems.every(item => item.selected);

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 px-6 lg:px-10 font-pretendard">
            <div className="max-w-[1280px] mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="text-[#333]" size={28} />
                        <h2 className="text-3xl font-black text-[#333] tracking-tight">장바구니</h2>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left: Cart Items */}
                    <div className="flex-[2] w-full flex flex-col gap-4">
                        {cartItems.length > 0 && (
                            <div className="flex items-center justify-between px-6 py-4 bg-white rounded-2xl border border-gray-100 mb-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 cursor-pointer accent-accent bg-white border-gray-300 rounded focus:ring-accent"
                                        checked={isAllSelected}
                                        onChange={toggleSelectAll}
                                    />
                                    <span className="ml-3 text-sm font-bold text-[#333] group-hover:text-accent transition-colors">전체 선택 ({selectedItems.length}/{cartItems.length})</span>
                                </label>
                                {selectedItems.length > 0 && (
                                    <button
                                        onClick={removeSelectedItems}
                                        className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                                    >
                                        선택 삭제
                                    </button>
                                )}
                            </div>
                        )}

                        {cartItems.map(item => (
                            <div key={item.id} className="group bg-white rounded-2xl p-6 flex items-center border border-gray-100 relative shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-gray-200">
                                <div className="mr-6">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 cursor-pointer accent-accent bg-white border-gray-300 rounded focus:ring-accent"
                                        checked={item.selected}
                                        onChange={() => toggleSelect(item.id)}
                                    />
                                </div>
                                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-[#F9F9F9] rounded-xl overflow-hidden mr-6 flex-shrink-0 border border-gray-50">
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-gray-400 mb-1 lg:text-base">{item.brand}</div>
                                    <div className="text-base font-medium text-[#333] mb-2 lg:text-lg truncate">{item.name}</div>
                                    <div className="text-sm text-gray-400 mb-3 font-medium">사이즈: {item.size}</div>
                                    <div className="text-lg font-black text-[#333] lg:text-xl">{item.price.toLocaleString()}원</div>
                                </div>
                                <button
                                    className="absolute top-6 right-6 p-2 text-gray-300 transition-colors hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    onClick={() => removeItem(item.id)}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ))}

                        {cartItems.length === 0 && (
                            <div className="bg-white rounded-2xl p-20 flex flex-col items-center justify-center border border-dashed border-gray-200 text-gray-400">
                                <ShoppingBag size={48} className="mb-4 opacity-20" />
                                <p className="text-lg font-medium">장바구니에 담긴 상품이 없습니다.</p>
                                <a href="/shop" className="mt-6 text-accent font-bold hover:underline">쇼핑하러 가기</a>
                            </div>
                        )}
                    </div>

                    {/* Right: Summary Container */}
                    <div className="flex-[1] w-full lg:sticky lg:top-[110px]">
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                            <h3 className="text-xl font-bold text-[#333] mb-8">주문 요약</h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>선택 상품</span>
                                    <span className="text-[#333]">{selectedItems.length}개</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>상품 총 금액</span>
                                    <span className="text-[#333]">{productAmount.toLocaleString()}원</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>검수 수수료 (3%)</span>
                                    <span className="text-[#333]">{commission.toLocaleString()}원</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>배송비</span>
                                    <span className="text-[#333]">무료</span>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 my-8"></div>

                            <div className="flex justify-between items-end mb-8">
                                <span className="font-bold text-[#333] text-lg">총 결제금액</span>
                                <span className="text-2xl font-black text-accent">{totalAmount.toLocaleString()}원</span>
                            </div>

                            <button className="w-full bg-accent text-white py-5 rounded-xl font-bold text-lg shadow-[0_8px_25px_rgba(92,107,192,0.3)] transition-all hover:bg-[#4a58b0] hover:shadow-[0_12px_30px_rgba(92,107,192,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:bg-gray-300 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed" disabled={selectedItems.length === 0}>
                                {totalAmount > 0 ? `${totalAmount.toLocaleString()}원 주문하기` : '주문하기'}
                            </button>

                            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                    주문 완료 후 검수가 진행되며,<br />
                                    검수 합격 후 배송이 시작됩니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
