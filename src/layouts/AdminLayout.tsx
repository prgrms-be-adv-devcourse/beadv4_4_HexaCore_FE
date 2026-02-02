import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/admin', label: '홈', exact: true },
    { path: '/admin/settlement', label: '정산' },
    { path: '/admin/products', label: '상품' },
    { path: '/admin/users', label: '회원' },
];

export const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isActive = (path: string, exact?: boolean) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

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
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            className={`flex items-center h-12 px-4 rounded-xl text-[15px] font-medium transition-all ${
                                isActive(item.path, item.exact)
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {item.label}
                        </NavLink>
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
                    <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
                    <aside className="relative w-72 bg-white flex flex-col">
                        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-[#e60023] flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">A</span>
                                </div>
                                <span className="ml-3 font-semibold text-gray-900">Admin</span>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 -mr-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <nav className="flex-1 p-4 space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.exact}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center h-12 px-4 rounded-xl text-[15px] font-medium transition-all ${
                                        isActive(item.path, item.exact)
                                            ? 'bg-gray-900 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>
                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={() => { navigate('/'); setSidebarOpen(false); }}
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
