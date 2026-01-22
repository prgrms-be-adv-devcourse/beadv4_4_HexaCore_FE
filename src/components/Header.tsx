import './Header.css';

export const Header = () => {
    return (
        <header className="header">
            <div className="header-container">
                <div className="logo">RESELLO</div>
                <nav className="nav">
                    <a href="/" className="nav-link">HOME</a>
                    <a href="/shop" className="nav-link">SHOP</a>
                </nav>
                <div className="user-actions">
                    <a href="/login" className="login-btn">Login</a>
                    <span>Search</span>
                    <span>Cart</span>
                    <span>Profile</span>
                </div>
            </div>
        </header>
    );
};
