import { useState } from 'react';
import './MyPage.css';
import { User, ShoppingBag, CreditCard, Grid } from 'lucide-react';

/* Mock Data for Transactions */
const TRANSACTIONS = [
    { id: 1, type: '충전', date: '2024-03-15', amount: 500000, balance: 1950000 },
    { id: 2, type: '구매', date: '2024-03-14', amount: -450000, balance: 1450000 },
];

/* Mock Data for Buying History */
const BUYING_HISTORY = [
    {
        id: 1,
        name: 'Nike Air Jordan 1 Chicago',
        size: '270',
        date: '2024-03-15',
        price: 450000,
        status: '배송완료'
    },
    {
        id: 2,
        name: 'Supreme Box Logo Hoodie',
        size: 'L',
        date: '2024-03-10',
        price: 850000,
        status: '결제 완료'
    },
];

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
                            <button className="charge-btn" onClick={() => setActiveTab('deposit')}>충전하기</button>
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
                    {activeTab === 'profile' && (
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
                    )}

                    {activeTab === 'deposit' && (
                        <div className="content-card">
                            <h3 className="section-title">예치금 관리</h3>

                            <div className="current-balance-box">
                                <div className="balance-label">현재 예치금</div>
                                <div className="balance-value">1,500,000원</div>
                            </div>

                            <div className="balance-actions">
                                <button className="action-btn charge">충전하기</button>
                                <button className="action-btn withdraw">출금하기</button>
                            </div>

                            <h4 className="subsection-title">최근 거래 내역</h4>
                            <div className="transaction-list">
                                {TRANSACTIONS.map(tx => (
                                    <div key={tx.id} className="transaction-item">
                                        <div className="tx-info">
                                            <div className="tx-type">{tx.type}</div>
                                            <div className="tx-date">{tx.date}</div>
                                        </div>
                                        <div className={`tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}원
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'buying' && (
                        <div className="content-card">
                            <h3 className="section-title">구매 내역</h3>
                            <div className="buying-list">
                                {BUYING_HISTORY.map(item => (
                                    <div key={item.id} className="buying-item">
                                        <div className="buying-info">
                                            <div className="buying-name">{item.name}</div>
                                            <div className="buying-details">
                                                사이즈: {item.size} | {item.date}
                                            </div>
                                        </div>
                                        <div className="buying-right">
                                            <div className="buying-price">{item.price.toLocaleString()}원</div>
                                            <div className={`buying-status ${item.status === '배송완료' ? 'completed' : 'pending'}`}>
                                                {item.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
