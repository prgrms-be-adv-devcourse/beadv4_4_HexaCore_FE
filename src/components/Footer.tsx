import './Footer.css';

export const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-column">
                    <h3>CUSTOMER SERVICE</h3>
                    <p>1588-7813</p>
                    <p>09:00 - 18:00</p>
                </div>
                <div className="footer-column">
                    <h3>MENU</h3>
                    <ul>
                        <li>About Us</li>
                        <li>Agreement</li>
                        <li>Privacy Policy</li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© 2026 RESELLO Corp.</p>
            </div>
        </footer>
    );
};
