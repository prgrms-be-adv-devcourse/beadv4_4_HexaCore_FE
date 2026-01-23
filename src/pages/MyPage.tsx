import { useState } from 'react';
import './MyPage.css';
import { User, ShoppingBag, CreditCard, Grid } from 'lucide-react';

export const MyPage = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="mypage">
            <h2 className="mypage-title">마이페이지</h2>

            <div className="mypage-content">
                {/* Left Sidebar */}
                <div className="mypage-sidebar">
                    <div className="user-profile-card">
                        <div className="profile-image">
                            <img src="https://placehold.co/100x100/png?text=User" alt="Profile" />
                        </div>
                        <div className="profile-name">김철수</div>
                        <div className="profile-email">user@example.com</div>

                        <div className="deposit-section">
                            <div className="deposit-label">예치금</div>
                            <div className="deposit-amount">1,500,000원</div>
                            <button className="charge-btn">충전하기</button>
                        </div>
                    </div>

                    <nav className="mypage-nav">
                        <button
                            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <User size={20} />
                            <span>프로필</span>
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'buying' ? 'active' : ''}`}
                            onClick={() => setActiveTab('buying')}
                        >
                            <ShoppingBag size={20} />
                            <span>구매내역</span>
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'selling' ? 'active' : ''}`}
                            onClick={() => setActiveTab('selling')}
                        >
                            <Grid size={20} />
                            <span>판매내역</span>
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'deposit' ? 'active' : ''}`}
                            onClick={() => setActiveTab('deposit')}
                        >
                            <CreditCard size={20} />
                            <span>예치금</span>
                        </button>
                    </nav>
                </div>

                {/* Right Content Area */}
                <div className="mypage-main">
                    <div className="content-card">
                        <h3 className="section-title">프로필 편집</h3>

                        <div className="form-group">
                            <label>이름</label>
                            <input type="text" defaultValue="김철수" />
                        </div>

                        <div className="form-group">
                            <label>이메일</label>
                            <input type="email" defaultValue="user@example.com" disabled />
                        </div>

                        <div className="form-group">
                            <label>전화번호</label>
                            <input type="tel" defaultValue="010-1234-5678" />
                        </div>

                        <button className="save-btn">저장하기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
