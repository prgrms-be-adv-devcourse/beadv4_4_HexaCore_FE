import { useState } from 'react';
import './Header.css';
import { ShoppingCart, Package, User, Bell } from 'lucide-react';

export const Header = () => {
    const [showNotifications, setShowNotifications] = useState(false);

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    return (
        <header className="header">
            <div className="header-container">
                <a href="/" className="logo-link">
                    <div className="logo">
                        Resello
                    </div>
                </a>
                <nav className="nav">
                    <a href="/shop" className="nav-link">쇼핑</a>
                    <a href="/style" className="nav-link">스타일</a>
                    <a href="/saved" className="nav-link">관심상품</a>
                </nav>
                <div className="user-actions">
                    <span className="icon-btn"><ShoppingCart size={20} /></span>
                    <span className="icon-btn"><Package size={20} /></span>
                    <span className="icon-btn"><User size={20} /></span>
                    <a href="/login" className="login-btn">로그인</a>

                    {/* Notification Section */}
                    <div className="notification-container">
                        <span className="icon-btn" onClick={toggleNotifications}>
                            <Bell size={20} />
                            <span className="notif-badge">N</span>
                        </span>

                        {showNotifications && (
                            <div className="notif-dropdown">
                                <div className="notif-header">
                                    <span>알림</span>
                                    <span className="mark-read">모두 읽음</span>
                                </div>
                                <div className="notif-list">
                                    <div className="notif-item unread">
                                        <p className="notif-text">관심 상품 <strong>조던 1 시카고</strong>의 가격이 하락했습니다.</p>
                                        <span className="notif-time">방금 전</span>
                                    </div>
                                    <div className="notif-item">
                                        <p className="notif-text">새로운 스타일 챌린지가 시작되었습니다!</p>
                                        <span className="notif-time">1시간 전</span>
                                    </div>
                                    <div className="notif-item">
                                        <p className="notif-text">배송이 시작되었습니다.</p>
                                        <span className="notif-time">어제</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
