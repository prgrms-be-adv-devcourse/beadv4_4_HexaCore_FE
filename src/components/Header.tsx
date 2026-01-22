import './Header.css';
import { ShoppingCart, Package, User, Zap } from 'lucide-react';

export const Header = () => {
    return (
        <header className="header">
            <div className="header-container">
                <div className="logo">
                    <span className="logo-icon"><Zap size={20} fill="white" /></span>Resello
                </div>
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
                </div>
            </div>
        </header>
    );
};
