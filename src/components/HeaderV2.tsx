import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, User, Bell, Menu, X, Search } from 'lucide-react';
import { Logo } from './Logo';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { logout } from '../api/auth';

import { useNavigate } from 'react-router-dom';
import { getNotifications, type NotificationResponse } from '../api/notification';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasNext, setHasNext] = useState(true);
    const listRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async (pageNum: number) => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await getNotifications(pageNum, 5);
            if (response.code === "OK") {
                setNotifications(prev => pageNum === 0 ? response.data.notificationResponses : [...prev, ...response.data.notificationResponses]);
                setHasNext(response.data.hasNext);
                setPage(pageNum);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    }, [loading]);

    useEffect(() => {
        fetchNotifications(0);
    }, []);

    const handleScroll = () => {
        const list = listRef.current;
        if (list) {
            const { scrollTop, scrollHeight, clientHeight } = list;
            if (scrollTop + clientHeight >= scrollHeight - 20 && hasNext && !loading) {
                fetchNotifications(page + 1);
            }
        }
    };

    const handleNotificationClick = (deepLink: string) => {
        navigate(deepLink);
    };

    // 시간 포맷팅 함수 (ISO string -> n분/시간/일 전)
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "방금 전";
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}시간 전`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}일 전`;
    };

    return (
        <div className="absolute top-[120%] right-0 w-[380px] bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden border border-white/20 origin-top-right animate-in fade-in zoom-in duration-300 z-[1001]">
            <div className="p-4 px-5 flex justify-between items-center border-b border-gray-100">
                <span className="text-sm font-bold text-gray-900">알림</span>
                <span className="text-xs text-gray-500 cursor-pointer font-medium hover:text-black">모두 읽음</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto scrollbar-hide" ref={listRef} onScroll={handleScroll}>
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.deepLink)}
                        className={`p-4 px-5 border-b border-gray-50 transition-all cursor-pointer hover:bg-black/5 ${!notif.isRead ? 'bg-indigo-50/50' : ''}`}
                    >
                        <div className="flex gap-3">
                            {!notif.isRead && <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />}
                            <div>
                                <p className="text-[13px] text-gray-800 leading-snug mb-1" dangerouslySetInnerHTML={{ __html: notif.body }}></p>
                                <span className="text-[11px] text-gray-400 font-medium">{formatTimeAgo(notif.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && <div className="p-4 text-center text-gray-400 text-xs">불러오는 중...</div>}
                {!loading && notifications.length === 0 && <div className="p-4 text-center text-gray-400 text-xs">새로운 알림이 없습니다.</div>}
            </div>
        </div>
    );
};

export const HeaderV2 = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const notifContainerRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated } = useAuthStore();
    const { cartItems, clearCart } = useCartStore();
    const { clearWishlist } = useWishlistStore();

    const handleLogout = async () => {
        await logout();
        clearCart();
        clearWishlist();
        window.location.href = '/';
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications, isMobileMenuOpen]);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 border-b ${isScrolled
                ? 'bg-white/80 backdrop-blur-md py-3 border-gray-100 shadow-sm'
                : 'bg-transparent py-5 border-transparent'
                }`}
        >
            <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex justify-between items-center">
                {/* Logo Section */}
                <div className="flex items-center gap-12">
                    <Link to="/" className="flex-shrink-0 group transition-transform hover:scale-105 active:scale-95">
                        <Logo size="lg" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-2">
                        {['HOME', 'SHOP', 'COMMUNITY', 'SAVED'].map((item) => (
                            <Link
                                key={item}
                                to={item === 'HOME' ? '/' : `/${item.toLowerCase()}`}
                                className="relative text-[13px] font-bold tracking-widest text-gray-900 px-4 py-2 rounded-full transition-all duration-300 hover:bg-black/5 hover:text-[#3949ab] group"
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Search Bar (Desktop) */}
                    <div className="hidden md:flex items-center bg-black/5 hover:bg-black/10 rounded-full px-4 py-2 transition-colors cursor-pointer group">
                        <Search size={18} className="text-gray-500 group-hover:text-black transition-colors" />
                        <input
                            type="text"
                            placeholder="검색어를 입력하세요"
                            className="bg-transparent border-none outline-none ml-2 text-sm w-32 focus:w-48 transition-all duration-300"
                        />
                    </div>

                    <div className="flex items-center gap-1 md:gap-3 relative" ref={notifContainerRef}>
                        {/* Notifications */}
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2.5 rounded-full hover:bg-black/5 transition-colors relative"
                        >
                            <Bell size={20} strokeWidth={2.5} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white" />
                        </button>

                        {showNotifications && <NotificationDropdown />}

                        <Link to="/mypage?tab=delivery" className="p-2.5 rounded-full hover:bg-black/5 transition-colors hidden sm:block">
                            <Package size={20} strokeWidth={2.5} />
                        </Link>

                        <Link to="/mypage?tab=profile" className="p-2.5 rounded-full hover:bg-black/5 transition-colors hidden sm:block">
                            <User size={20} strokeWidth={2.5} />
                        </Link>

                        <Link to="/cart" className="p-2.5 rounded-full hover:bg-black/5 transition-colors relative">
                            <ShoppingCart size={20} strokeWidth={2.5} />
                            {cartItems.length > 0 && (
                                <span className="absolute top-0.5 -right-1 bg-accent text-white text-[10px] font-bold px-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>

                        {isAuthenticated ? (
                            <button
                                onClick={handleLogout}
                                className="hidden md:block text-[13px] font-bold px-5 py-2 hover:text-[#3949ab] transition-colors"
                            >
                                LOGOUT
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="hidden md:block bg-accent text-white px-6 py-2.5 rounded-full text-[13px] font-bold hover:bg-[#3949ab] transition-all active:scale-95"
                            >
                                LOGIN
                            </Link>
                        )}
                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden p-2 text-gray-900"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    ref={mobileMenuRef}
                    className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-50 flex flex-col p-8 z-[999] animate-in slide-in-from-top duration-300"
                >
                    <nav className="flex flex-col gap-6 mb-8">
                        {['HOME', 'SHOP', 'COMMUNITY', 'SAVED'].map((item) => (
                            <Link
                                key={item}
                                to={item === 'HOME' ? '/' : `/${item.toLowerCase()}`}
                                className="text-2xl font-bold text-gray-900"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>

                    <div className="grid grid-cols-2 gap-4 mt-auto border-t border-gray-100 pt-8">
                        <Link to="/mypage?tab=profile" className="flex items-center gap-3 font-bold text-gray-600" onClick={() => setIsMobileMenuOpen(false)}>
                            <User size={20} /> MY PAGE
                        </Link>
                        <Link to="/cart" className="flex items-center gap-3 font-bold text-gray-600" onClick={() => setIsMobileMenuOpen(false)}>
                            <ShoppingCart size={20} /> CART
                        </Link>
                        <div className="flex items-center gap-3 font-bold text-gray-600 cursor-pointer" onClick={() => { setIsMobileMenuOpen(false); /* Add delivery logic later */ }}>
                            <Package size={20} /> DELIVERY
                        </div>
                        {isAuthenticated ? (
                            <button onClick={handleLogout} className="col-span-2 bg-gray-100 p-4 rounded-xl font-bold mt-4">LOGOUT</button>
                        ) : (
                            <Link to="/login" className="col-span-2 bg-accent text-white p-4 rounded-xl font-bold text-center mt-4 hover:bg-[#3949ab] transition-colors">LOGIN</Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};
