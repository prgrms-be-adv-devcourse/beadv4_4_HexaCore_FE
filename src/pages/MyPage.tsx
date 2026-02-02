import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, ShoppingBag, CreditCard, Grid, ChevronRight, Settings, LogOut, Truck, Bell, Trash2 } from 'lucide-react';
import { updateNotificationSettings, getNotificationSettings } from '../api/user';
import { getPriceAlerts, deletePriceAlert, type PriceAlertResponseDto } from '../api/priceAlert';

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
        status: '배송 완료'
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

/* Mock Data for Selling History */
const SELLING_HISTORY = [
    {
        id: 1,
        name: 'Adidas Yeezy Boost 350',
        size: '265',
        date: '2024-03-12',
        price: 380000,
        status: '판매 완료'
    },
    {
        id: 2,
        name: 'Nike Air Jordan 1 Chicago',
        size: '275',
        date: '2024-03-16',
        price: 1200000,
        status: '검수 중'
    },
];

/* Mock Data for Delivery History */
const DELIVERY_HISTORY = [
    {
        id: 1,
        name: 'Nike Air Jordan 1 Chicago',
        date: '2024-03-15',
        trackingNumber: 'CJ1234567890',
        courier: 'CJ대한통운',
        status: '배송 완료'
    },
    {
        id: 2,
        name: 'Supreme Box Logo Hoodie',
        date: '2024-03-10',
        trackingNumber: 'POST0987654321',
        courier: '우체국택배',
        status: '배송 중'
    },
];

export const MyPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabParam || 'profile');

    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-[120px] pb-24 px-6 lg:px-10 font-pretendard">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex items-center gap-3 mb-10">
                    <User className="text-[#333]" size={28} />
                    <h2 className="text-3xl font-black text-[#333] tracking-tight">마이페이지</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left Sidebar */}
                    <aside className="w-full lg:w-[280px] space-y-6 flex-shrink-0">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-100 p-1 mb-4">
                                    <img
                                        src="https://placehold.co/100x100/png?text=User"
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                                <h3 className="text-lg font-bold text-[#333]">테스터</h3>
                                <p className="text-sm text-gray-400 mb-6">tester@example.com</p>

                                <div className="w-full pt-6 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-gray-400">결제 예치금</span>
                                        <span className="text-xs font-bold text-accent hover:underline cursor-pointer">상세내역</span>
                                    </div>
                                    <div className="text-xl font-black text-[#333] mb-4 mt-3">1,500,000원</div>
                                    <button
                                        className="w-full bg-[#f8f9fa] text-[#333] py-2.5 rounded-xl font-bold text-sm transition-colors hover:bg-gray-100"
                                        onClick={() => handleTabChange('deposit')}
                                    >
                                        충전하기
                                    </button>
                                </div>
                            </div>
                        </div>

                        <nav className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                            <button
                                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-all ${activeTab === 'profile' ? 'text-accent bg-accent/5' : 'text-gray-500 hover:bg-gray-50'}`}
                                onClick={() => handleTabChange('profile')}
                            >
                                <User size={18} />
                                <span>프로필 정보</span>
                            </button>
                            <button
                                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-all ${activeTab === 'buying' ? 'text-accent bg-accent/5' : 'text-gray-500 hover:bg-gray-50'}`}
                                onClick={() => handleTabChange('buying')}
                            >
                                <ShoppingBag size={18} />
                                <span>구매 내역</span>
                            </button>
                            <button
                                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-all ${activeTab === 'selling' ? 'text-accent bg-accent/5' : 'text-gray-500 hover:bg-gray-50'}`}
                                onClick={() => handleTabChange('selling')}
                            >
                                <Grid size={18} />
                                <span>판매 내역</span>
                            </button>
                            <button
                                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-all ${activeTab === 'delivery' ? 'text-accent bg-accent/5' : 'text-gray-500 hover:bg-gray-50'}`}
                                onClick={() => handleTabChange('delivery')}
                            >
                                <Truck size={18} />
                                <span>배송 내역</span>
                            </button>
                            <button
                                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-all ${activeTab === 'deposit' ? 'text-accent bg-accent/5' : 'text-gray-500 hover:bg-gray-50'}`}
                                onClick={() => handleTabChange('deposit')}
                            >
                                <CreditCard size={18} />
                                <span>예치금 관리</span>
                            </button>
                            <div className="h-px bg-gray-50 mx-4"></div>
                            <button
                                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-all ${activeTab === 'notification' ? 'text-accent bg-accent/5' : 'text-gray-500 hover:bg-gray-50'}`}
                                onClick={() => handleTabChange('notification')}
                            >
                                <Bell size={18} />
                                <span>알림 설정</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-6 py-4 text-sm font-bold text-gray-400 hover:bg-gray-50 transition-all">
                                <Settings size={18} />
                                <span>설정</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-6 py-4 text-sm font-bold text-red-400 hover:bg-red-50 transition-all">
                                <LogOut size={18} />
                                <span>로그아웃</span>
                            </button>
                        </nav>
                    </aside>

                    {/* Right Content Area */}
                    <main className="flex-1 w-full space-y-6">
                        {activeTab === 'profile' && (
                            <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                <h3 className="text-xl font-bold text-[#333] mb-8 pb-4 border-b border-gray-100">프로필 정보</h3>

                                <div className="space-y-6 max-w-[480px] mx-auto py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400">이메일 주소</label>
                                        <input
                                            type="email"
                                            defaultValue="user@example.com"
                                            disabled
                                            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl text-gray-400 cursor-not-allowed font-medium"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400">닉네임</label>
                                        <input
                                            type="text"
                                            defaultValue="철수짱"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-accent font-medium text-[#333]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400">이름</label>
                                        <input
                                            type="text"
                                            defaultValue="김철수"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-accent font-medium text-[#333]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400">전화번호</label>
                                        <input
                                            type="tel"
                                            defaultValue="010-1234-5678"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-accent font-medium text-[#333]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400">기본 배송지</label>
                                        <input
                                            type="text"
                                            defaultValue="서울특별시 강남구 테헤란로 123"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-accent font-medium text-[#333]"
                                        />
                                    </div>

                                    <button className="w-full bg-accent text-white py-4 rounded-xl font-bold shadow-lg shadow-accent/20 transition-all hover:bg-[#4a58b0] hover:-translate-y-0.5 mt-4">
                                        수정 사항 저장
                                    </button>
                                </div>
                            </section>
                        )}

                        {activeTab === 'deposit' && (
                            <section className="space-y-6">
                                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                    <h3 className="text-xl font-bold text-[#333] mb-8">예치금 현황</h3>

                                    <div className="bg-[#F8F9FA] rounded-2xl p-8 border border-gray-100 flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                                        <div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Balance</div>
                                            <div className="text-4xl font-black text-accent tracking-tighter">1,500,000<span className="text-xl ml-1 font-bold text-gray-300">원</span></div>
                                        </div>
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <button className="flex-1 md:flex-none bg-accent text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-accent/20 transition-all hover:bg-[#4a58b0] hover:-translate-y-0.5">충전</button>
                                            <button className="flex-1 md:flex-none bg-white text-gray-700 border-2 border-gray-400 px-8 py-3 rounded-xl font-bold text-sm shadow-sm transition-all hover:bg-gray-50 hover:border-gray-600 hover:text-[#333]">출금</button>
                                        </div>
                                    </div>

                                    <h4 className="text-lg font-bold text-[#333] mb-6">최근 거래 내역</h4>
                                    <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                                        {TRANSACTIONS.map(tx => (
                                            <div key={tx.id} className="p-5 flex justify-between items-center bg-white transition-colors hover:bg-gray-50">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                                        {tx.type === '충전' ? <ChevronRight size={18} className="rotate-270" /> : <ChevronRight size={18} className="rotate-90" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-[#333]">{tx.type}</div>
                                                        <div className="text-xs font-medium text-gray-400">{tx.date}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`font-black ${tx.amount > 0 ? 'text-green-500' : 'text-[#333]'}`}>
                                                        {tx.amount > 0 ? '+' : ''}{(tx.amount || 0).toLocaleString()}원
                                                    </div>
                                                    <div className="text-xs font-medium text-gray-400">잔액 {(tx.balance || 0).toLocaleString()}원</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {(activeTab === 'buying' || activeTab === 'selling') && (
                            <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-[#333]">
                                <h3 className="text-xl font-bold mb-8 pb-4 border-b border-gray-100">
                                    {activeTab === 'buying' ? '구매 내역' : '판매 내역'}
                                </h3>
                                <div className="space-y-4">
                                    {(activeTab === 'buying' ? BUYING_HISTORY : SELLING_HISTORY).map(item => (
                                        <div key={item.id} className="p-6 flex justify-between items-center border border-gray-100 rounded-2xl transition-all hover:bg-gray-50 cursor-pointer group">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-xl flex-shrink-0 border border-gray-100 p-2 overflow-hidden">
                                                    <img
                                                        src={`https://placehold.co/100x100/png?text=${item.name.split(' ')[0]}`}
                                                        alt={item.name}
                                                        className="w-full h-full object-contain mix-blend-multiply"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-bold group-hover:text-accent transition-colors">{item.name}</div>
                                                    <div className="text-sm font-medium text-gray-400 flex items-center gap-2 mt-1">
                                                        <span>사이즈: {item.size}</span>
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                        <span>{item.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-2">
                                                <div className="font-black text-lg">{(item.price || 0).toLocaleString()}원</div>
                                                <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${['배송 완료', '판매 완료'].includes(item.status)
                                                    ? 'bg-green-100 text-green-600'
                                                    : ['결제 완료', '검수 중'].includes(item.status)
                                                        ? 'bg-accent/10 text-accent'
                                                        : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeTab === 'delivery' && (
                            <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                <h3 className="text-xl font-bold text-[#333] mb-8 pb-4 border-b border-gray-100 uppercase">배송 내역</h3>
                                <div className="space-y-4">
                                    {DELIVERY_HISTORY.map(item => (
                                        <div key={item.id} className="p-6 border border-gray-100 rounded-2xl transition-all hover:bg-gray-50">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="text-sm font-bold text-gray-400 mb-1">{item.date}</div>
                                                    <div className="text-lg font-bold text-[#333]">{item.name}</div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${item.status === '배송 완료'
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                <div className="text-sm font-medium text-gray-500">
                                                    <span className="mr-2">{item.courier}</span>
                                                    <span className="text-gray-300 mr-2">|</span>
                                                    <span>{item.trackingNumber}</span>
                                                </div>
                                                <button className="text-xs font-bold text-accent hover:underline">배송 조회</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        {activeTab === 'notification' && (
                            <div className="space-y-6">
                                <NotificationSettings />
                                <PriceAlertList />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

const NotificationSettings = () => {
    // NOTE: 초기값을 false로 설정. 백엔드에서 GET API가 있다면 여기서 불러와야 함.
    const [settings, setSettings] = useState({
        bidStatusEnabled: false,
        productStatusEnabled: false,
        priceEnabled: false,
        settlementEnabled: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getNotificationSettings();

                // snake_case 대응 및 boolean 변환
                const safeData: any = data;
                setSettings({
                    bidStatusEnabled: !!(safeData.bidStatusEnabled ?? safeData.bid_status_enabled),
                    productStatusEnabled: !!(safeData.productStatusEnabled ?? safeData.product_status_enabled),
                    priceEnabled: !!(safeData.priceEnabled ?? safeData.price_enabled),
                    settlementEnabled: !!(safeData.settlementEnabled ?? safeData.settlement_enabled),
                });
            } catch (error) {
                console.error("Failed to fetch notification settings:", error);
            } finally {
                setIsInitialLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateNotificationSettings(settings);
            alert("알림 설정이 저장되었습니다.");
        } catch (error) {
            console.error(error);
            alert("알림 설정 저장에 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <h3 className="text-xl font-bold text-[#333] mb-8 pb-4 border-b border-gray-100">알림 설정</h3>

            {isInitialLoading ? (
                // 데이터 로딩 전에는 투명한/빈 화면을 보여주어 깜빡임 방지
                <div className="h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
            ) : (
                <div className="max-w-[480px] mx-auto space-y-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-bold text-[#333] mb-1">입찰 알림</div>
                            <div className="text-xs text-gray-400">입찰 상태 변경 시 알림을 받습니다.</div>
                        </div>
                        <button
                            onClick={() => handleToggle('bidStatusEnabled')}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.bidStatusEnabled ? 'bg-accent' : 'bg-gray-200'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings.bidStatusEnabled ? 'left-[26px]' : 'left-0.5'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-bold text-[#333] mb-1">상품 알림</div>
                            <div className="text-xs text-gray-400">관심 상품의 정보를 알림으로 받습니다.</div>
                        </div>
                        <button
                            onClick={() => handleToggle('productStatusEnabled')}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.productStatusEnabled ? 'bg-accent' : 'bg-gray-200'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings.productStatusEnabled ? 'left-[26px]' : 'left-0.5'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-bold text-[#333] mb-1">가격 알림</div>
                            <div className="text-xs text-gray-400">설정한 가격 도달 시 알림을 받습니다.</div>
                        </div>
                        <button
                            onClick={() => handleToggle('priceEnabled')}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.priceEnabled ? 'bg-accent' : 'bg-gray-200'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings.priceEnabled ? 'left-[26px]' : 'left-0.5'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-bold text-[#333] mb-1">정산 알림</div>
                            <div className="text-xs text-gray-400">정산 완료 시 알림을 받습니다.</div>
                        </div>
                        <button
                            onClick={() => handleToggle('settlementEnabled')}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.settlementEnabled ? 'bg-accent' : 'bg-gray-200'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings.settlementEnabled ? 'left-[26px]' : 'left-0.5'}`} />
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full bg-accent text-white py-4 rounded-xl font-bold shadow-lg shadow-accent/20 transition-all hover:bg-[#4a58b0] hover:-translate-y-0.5 mt-8 disabled:opacity-50"
                    >
                        {isLoading ? '저장 중...' : '설정 저장'}
                    </button>
                </div>
            )}
        </section>
    );
};

const PriceAlertList = () => {
    const [alerts, setAlerts] = useState<PriceAlertResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const data = await getPriceAlerts();
                const alertList = Array.isArray(data) ? data : [];
                setAlerts(alertList);
            } catch (error) {
                console.error("Failed to fetch price alerts:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    const handleDelete = async (alertId: number) => {
        if (!window.confirm("정말 이 알림을 삭제하시겠습니까?")) return;

        try {
            await deletePriceAlert(alertId);
            setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
        } catch (error) {
            console.error("Failed to delete price alert:", error);
            alert("알림 삭제에 실패했습니다.");
        }
    };

    if (isLoading) {
        return (
            <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <h3 className="text-xl font-bold text-[#333] mb-8 pb-4 border-b border-gray-100">가격 알림 목록</h3>
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <h3 className="text-xl font-bold text-[#333] mb-8 pb-4 border-b border-gray-100">가격 알림 목록</h3>

            {alerts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    설정된 가격 알림이 없습니다.
                </div>
            ) : (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl transition-all hover:bg-gray-50 bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 border border-gray-100 p-1 overflow-hidden flex items-center justify-center">
                                    <ShoppingBag className="text-gray-300" size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#333]">상품 ID: {alert.productId}</h4>
                                    <div className="text-sm text-gray-400 mt-1">
                                        목표 가격: <span className="font-bold text-accent">{alert.targetPrice.toLocaleString()}원</span>
                                    </div>
                                    <div className="text-xs text-gray-300 mt-1">
                                        등록일: {new Date(alert.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(alert.id)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                aria-label="알림 삭제"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};
