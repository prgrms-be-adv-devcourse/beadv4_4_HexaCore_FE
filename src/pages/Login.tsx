import './Login.css';

export const Login = () => {
    const handleLogin = (provider: string) => {
        console.log(`Login with ${provider}`);
        // Login logic will be implemented here
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>Log In</h2>
                <div className="social-login-buttons">
                    <button
                        className="social-btn naver"
                        onClick={() => handleLogin('Naver')}
                    >
                        네이버 로그인
                    </button>
                    <button
                        className="social-btn kakao"
                        onClick={() => handleLogin('Kakao')}
                    >
                        카카오 로그인
                    </button>
                    <button
                        className="social-btn google"
                        onClick={() => handleLogin('Google')}
                    >
                        구글 로그인
                    </button>
                </div>
            </div>
        </div>
    );
};
