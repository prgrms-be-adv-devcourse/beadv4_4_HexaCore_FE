import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface NavItemType {
    label: string;
    exact?: boolean;
    children?: NavItemType[];
}

const navItems: NavItemType[] = [
    { path: '/admin', label: '홈', exact: true },
    { path: '/admin/settlement', label: '정산' },
    {
        label: '상품',
        children: [
            { path: '/admin/products', label: '상품 목록', exact: true },
            { path: '/admin/brands', label: '브랜드 관리' },
            { path: '/admin/categories', label: '카테고리 관리' },
            { path: '/admin/options', label: '옵션 관리' },
        ],
    },
    { path: '/admin/users', label: '회원' },
];

const NavItem = ({ item, closeSidebar }: { item: NavItemType, closeSidebar?: () => void }) => {
    const location = useLocation();
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(() => 
        item.children ? item.children.some(child => location.pathname.startsWith(child.path!)) : false
    );

    const isParentActive = item.children 
        ? item.children.some(child => location.pathname.startsWith(child.path!))
        : (item.path && location.pathname === item.path) || (!item.exact && item.path && location.pathname.startsWith(item.path));
        
    const handleToggle = () => {
        if (item.children) {
            setIsSubmenuOpen(!isSubmenuOpen);
        } else {
            closeSidebar?.();
        }
    };

    if (item.children) {
        return (
            <div>
                <button
                    onClick={handleToggle}
                    className={`flex items-center justify-between w-full h-12 px-4 rounded-xl text-[15px] font-medium transition-all ${
                        isParentActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <span>{item.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isSubmenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSubmenuOpen && (
                    <div className="pt-2 pl-4 space-y-1">
                        {item.children.map(child => (
                            <NavLink
                                key={child.path}
                                to={child.path!}
                                end={child.exact}
                                onClick={closeSidebar}
                                className={({ isActive }) => 
                                    `flex items-center h-10 px-3 rounded-lg text-sm transition-all ${
                                        isActive ? 'font-semibold text-gray-800 bg-gray-100' : 'font-medium text-gray-500 hover:bg-gray-100'
                                    }`
                                }
                            >
                                {child.label}
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <NavLink
            to={item.path!}
            end={item.exact}
            onClick={handleToggle}
            className={`flex items-center h-12 px-4 rounded-xl text-[15px] font-medium transition-all ${
                isParentActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            {item.label}
        </NavLink>
    );
};

export const AdminLayout = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="flex min-h-screen bg-[#f5f5f5]">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-200">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-[#e60023] flex items-center justify-center">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <span className="ml-3 font-semibold text-gray-900">Admin</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavItem key={item.label} item={item} />
                    ))}
                </nav>

                {/* Bottom */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full h-12 px-4 rounded-xl text-[15px] font-medium text-gray-500 hover:bg-gray-100 text-left transition-all"
                    >
                        사이트로 이동
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-black/40" onClick={closeSidebar} />
                    <aside className="relative w-72 bg-white flex flex-col">
                        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-[#e60023] flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">A</span>
                                </div>
                                <span className="ml-3 font-semibold text-gray-900">Admin</span>
                            </div>
                            <button onClick={closeSidebar} className="p-2 -mr-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <nav className="flex-1 p-4 space-y-1">
                            {navItems.map((item) => (
                                <NavItem key={item.label} item={item} closeSidebar={closeSidebar} />
                            ))}
                        </nav>
                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={() => { navigate('/'); closeSidebar(); }}
                                className="w-full h-12 px-4 rounded-xl text-[15px] font-medium text-gray-500 hover:bg-gray-100 text-left"
                            >
                                사이트로 이동
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 sticky top-0 z-40">
                    {/* Mobile menu */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 -ml-2 mr-2 rounded-lg hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="flex-1" />

                    {/* Profile */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-600">A</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
