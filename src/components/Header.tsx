import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, User, Bell, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { logout } from '../api/auth';

const INITIAL_NOTIFICATIONS = [
    { id: 1, text: "관심 상품 <strong>조던 1 시카고</strong>의 가격이 하락했습니다.", time: "방금 전", unread: false },
    { id: 2, text: "새로운 스타일 챌린지가 시작되었습니다!", time: "1시간 전", unread: false },
    { id: 3, text: "배송이 시작되었습니다.", time: "어제", unread: false },
    { id: 4, text: "관심 상품 <strong>나이키 덩크 로우</strong> 재입고 알림", time: "2일 전", unread: false },
    { id: 5, text: "회원 등급이 상향 조정되었습니다.", time: "3일 전", unread: false },
    { id: 6, text: "주문하신 상품이 발송되었습니다.", time: "4일 전", unread: false },
    { id: 7, text: "새로운 이벤트가 시작되었습니다. 확인해보세요!", time: "5일 전", unread: false },
    { id: 8, text: "관심 상품 <strong>아디다스 삼바</strong> 재입고 알림", time: "1주 전", unread: false },
    { id: 9, text: "비밀번호 변경 안내", time: "1주 전", unread: false },
    { id: 10, text: "이용약관이 개정되었습니다.", time: "2주 전", unread: false },
];

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [loading, setLoading] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    const loadMoreNotifications = useCallback(() => {
        if (loading || notifications.length >= 20) return;
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            const currentLength = notifications.length;
            const remaining = 20 - currentLength;
            const countToAdd = Math.min(5, remaining);

            if (countToAdd <= 0) {
                setLoading(false);
                return;
            }

            const moreNotifications = Array.from({ length: countToAdd }).map((_, i) => ({
                id: currentLength + i + 1,
                text: `이전 알림 내용입니다. #${currentLength + i + 1}`,
                time: `${currentLength + i}일 전`,
                unread: false
            }));

            setNotifications(prev => [...prev, ...moreNotifications]);
            setLoading(false);
        }, 800);
    }, [loading, notifications.length]);

    const handleScroll = () => {
        const list = listRef.current;
        if (list) {
            const { scrollTop, scrollHeight, clientHeight } = list;
            if (scrollTop + clientHeight >= scrollHeight - 20) {
                loadMoreNotifications();
            }
        }
    };

    return (
        <div className="absolute top-[48px] right-0 w-[420px] bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden border border-solid border-gray-200 origin-top-right animate-in fade-in zoom-in duration-200 z-[1001]">
            <div className="bg-[#f8f9fa] p-3 px-4 flex justify-between items-center border-b border-solid border-[#efefef] text-[0.9rem] font-bold text-[#333]">
                <span>알림</span>
                <span className="text-[0.75rem] color-[#888] cursor-pointer font-medium hover:text-[#333]">모두 읽음</span>
            </div>
            <div className="max-height-[500px] overflow-y-auto" ref={listRef} onScroll={handleScroll}>
                {notifications.map((notif) => (
                    <div key={notif.id} className={`p-3 px-4 border-b border-solid border-[#f5f5f5] transition-colors cursor-pointer hover:bg-[#e8eaf6] ${notif.unread ? 'bg-[#eef2ff]' : 'bg-white'}`}>
                        <p className="notif-text text-[0.85rem] text-[#333] leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: notif.text }}></p>
                        <span className="text-[0.75rem] text-[#999]">{notif.time}</span>
                    </div>
                ))}
                {loading && <div className="p-3 text-center text-[#999] text-[0.85rem]">불러오는 중...</div>}
            </div>
        </div>
    );
};

export const Header = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const notifContainerRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated } = useAuthStore();
    const { clearCart } = useCartStore();
    const { clearWishlist } = useWishlistStore();

    const handleLogout = async () => {
        await logout();
        clearCart();
        clearWishlist();
        window.location.href = '/';
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifContainerRef.current && !notifContainerRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };

        if (showNotifications || isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications, isMobileMenuOpen]);

    return (
        <header className="fixed top-2.5 left-2.5 right-2.5 z-[1000] bg-[#F5F5F7] rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300">
            <div className="max-w-[1280px] mx-auto px-8 py-2.5 flex justify-between items-center max-md:px-6">
                <a href="/" className="no-underline flex-shrink-0">
                    <Logo size="lg" />
                </a>

                <nav className="hidden md:flex gap-6 lg:gap-10 ml-8 lg:ml-[110px] font-pretendard">
                    <a href="/" className="no-underline text-[#333] font-bold text-base opacity-90 transition-opacity hover:opacity-100">HOME</a>
                    <a href="/shop" className="no-underline text-[#333] font-bold text-base opacity-90 transition-opacity hover:opacity-100">SHOP</a>
                    <a href="/community" className="no-underline text-[#333] font-bold text-base opacity-90 transition-opacity hover:opacity-100">COMMUNITY</a>
                    <a href="/saved" className="no-underline text-[#333] font-bold text-base opacity-90 transition-opacity hover:opacity-100">SAVED</a>
                </nav>

                <div className="flex items-center gap-4 font-pretendard flex-shrink-0">
                    <div className="hidden md:flex items-center gap-3 lg:gap-4 relative" ref={notifContainerRef}>
                        {/* Notification Section */}
                        <button className="flex items-center justify-center w-9 h-9 text-[#333] opacity-90 bg-transparent border border-solid border-[#d1d5db] rounded-lg transition-all hover:bg-black/5 hover:border-gray-400 relative cursor-pointer" onClick={toggleNotifications}>
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#e8eaf6]">N</span>
                        </button>

                        {showNotifications && (
                            <NotificationDropdown />
                        )}

                        <Link to="/mypage?tab=delivery" className="flex items-center justify-center w-9 h-9 text-[#333] opacity-90 bg-transparent border border-solid border-[#d1d5db] rounded-lg transition-all hover:bg-black/5 hover:border-gray-400 cursor-pointer">
                            <Package size={20} />
                        </Link>

                        <Link to="/mypage" className="flex items-center justify-center w-9 h-9 text-[#333] opacity-90 bg-transparent border border-solid border-[#d1d5db] rounded-lg transition-all hover:bg-black/5 hover:border-gray-400">
                            <User size={20} />
                        </Link>

                        <Link to="/cart" className="flex items-center justify-center w-9 h-9 text-[#333] opacity-90 bg-transparent border border-solid border-[#d1d5db] rounded-lg transition-all hover:bg-black/5 hover:border-gray-400">
                            <ShoppingCart size={20} />
                        </Link>

                        {isAuthenticated ? (
                            <button
                                onClick={handleLogout}
                                className="no-underline text-[#333] bg-transparent border border-gray-300 px-[18px] py-2 rounded-md text-[0.9rem] font-semibold transition-colors hover:bg-gray-100 cursor-pointer"
                            >
                                로그아웃
                            </button>
                        ) : (
                            <a href="/login" className="no-underline text-white bg-accent px-[18px] py-2 rounded-md text-[0.9rem] font-semibold transition-colors hover:bg-[#3949ab]">로그인</a>
                        )}
                    </div>

                    <button className="md:hidden flex items-center justify-center p-2 text-[#333] bg-transparent border-none cursor-pointer" onClick={toggleMobileMenu}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white m-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-6 z-[999] border border-solid border-black/5 animate-in slide-in-from-top-2 duration-300" ref={mobileMenuRef}>
                    <nav className="flex flex-col gap-4 font-pretendard">
                        <a href="/" className="no-underline text-[#333] text-[1.1rem] font-bold" onClick={() => setIsMobileMenuOpen(false)}>HOME</a>
                        <a href="/shop" className="no-underline text-[#333] text-[1.1rem] font-bold" onClick={() => setIsMobileMenuOpen(false)}>SHOP</a>
                        <a href="/community" className="no-underline text-[#333] text-[1.1rem] font-bold" onClick={() => setIsMobileMenuOpen(false)}>COMMUNITY</a>
                        <a href="/saved" className="no-underline text-[#333] text-[1.1rem] font-bold" onClick={() => setIsMobileMenuOpen(false)}>SAVED</a>
                    </nav>
                    <div className="border-t border-solid border-[#f0f0f0] pt-6 flex flex-col gap-4 font-pretendard">
                        <Link to="/cart" className="flex items-center gap-3 no-underline text-[#555] text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                            <ShoppingCart size={20} /> 장바구니
                        </Link>
                        <Link to="/mypage" className="flex items-center gap-3 no-underline text-[#555] text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                            <User size={20} /> 마이페이지
                        </Link>
                        <div className="flex items-center gap-3 text-[#555] text-base font-medium cursor-pointer" onClick={() => { setIsMobileMenuOpen(false); /* Add delivery logic later */ }}>
                            <Package size={20} /> 배송
                        </div>
                        <div className="flex items-center gap-3 text-[#555] text-base font-medium cursor-pointer" onClick={() => { setIsMobileMenuOpen(false); toggleNotifications(); }}>
                            <Bell size={20} /> 알림
                        </div>
                        {isAuthenticated ? (
                            <button
                                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                className="block w-full text-center bg-gray-100 text-[#333] p-3 rounded-lg border-none font-bold mt-2 hover:bg-gray-200 cursor-pointer"
                            >
                                로그아웃
                            </button>
                        ) : (
                            <a href="/login" className="block text-center bg-accent text-white p-3 rounded-lg no-underline font-bold mt-2 hover:bg-[#3949ab]" onClick={() => setIsMobileMenuOpen(false)}>로그인</a>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

