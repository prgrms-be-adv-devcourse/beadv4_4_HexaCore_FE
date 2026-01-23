import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { ShoppingCart, Package, User, Bell } from 'lucide-react';
import { Logo } from './Logo';

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
        <div className="notif-dropdown">
            <div className="notif-header">
                <span>알림</span>
                <span className="mark-read">모두 읽음</span>
            </div>
            <div className="notif-list" ref={listRef} onScroll={handleScroll}>
                {notifications.map((notif) => (
                    <div key={notif.id} className={`notif-item ${notif.unread ? 'unread' : ''}`}>
                        <p className="notif-text" dangerouslySetInnerHTML={{ __html: notif.text }}></p>
                        <span className="notif-time">{notif.time}</span>
                    </div>
                ))}
                {loading && <div className="notif-item" style={{ textAlign: 'center', color: '#999' }}>불러오는 중...</div>}
            </div>
        </div>
    );
};
export const Header = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const notifContainerRef = useRef<HTMLDivElement>(null);

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifContainerRef.current && !notifContainerRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    return (
        <header className="header">
            <div className="header-container">
                <a href="/" className="logo-link">
                    <Logo size="lg" />
                </a>
                <nav className="nav font-pretendard">
                    <a href="/shop" className="nav-link">쇼핑</a>
                    <a href="/style" className="nav-link">스타일</a>
                    <a href="/saved" className="nav-link">관심상품</a>
                </nav>
                <div className="user-actions font-pretendard">
                    <Link to="/cart" className="icon-btn">
                        <ShoppingCart size={20} />
                    </Link>
                    <span className="icon-btn"><Package size={20} /></span>
                    <Link to="/mypage" className="icon-btn">
                        <User size={20} />
                    </Link>
                    <a href="/login" className="login-btn">로그인</a>

                    {/* Notification Section */}
                    <div className="notification-container" ref={notifContainerRef}>
                        <span className="icon-btn" onClick={toggleNotifications}>
                            <Bell size={20} />
                            <span className="notif-badge">N</span>
                        </span>

                        {showNotifications && (
                            <NotificationDropdown />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
