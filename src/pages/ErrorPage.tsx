import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Home, RefreshCcw, ChevronLeft } from 'lucide-react';

export const ErrorPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // URL 검색 파라미터에서 정보 추출
    const searchParams = new URLSearchParams(location.search);
    // 주소창 오타 등으로 들어온 경우(status가 없음) 기본값을 404로 설정
    const status = searchParams.get('status') ? parseInt(searchParams.get('status')!) : 404;
    const message = searchParams.get('message');
    const path = searchParams.get('path') || location.pathname;
    const apiUrl = searchParams.get('apiUrl');
    const method = searchParams.get('method');

    useEffect(() => {
        console.group('Error Page Details');
        console.error('Status:', status);
        console.error('Message:', message || (status === 404 ? 'Page Not Found' : 'Internal Server Error'));
        console.error('Path:', path);
        if (apiUrl) {
            console.error('Failed API:', `${method || 'GET'} ${apiUrl}`);
        }
        console.error('Full URL:', window.location.href);
        console.groupEnd();
    }, [status, message, path, apiUrl, method]);

    const is404 = status === 404;

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 font-pretendard">
            <div className="max-w-md w-full text-center">
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl opacity-50 scale-150 animate-pulse"></div>
                        <div className="relative bg-white p-6 rounded-full shadow-sm border border-red-500/10">
                            <AlertCircle size={64} className="text-red-500" />
                        </div>
                    </div>
                </div>

                <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                    {status} Error
                </h1>

                <h2 className="text-xl font-bold text-gray-800 mb-6">
                    {is404 ? '페이지를 찾을 수 없습니다' : '일시적인 오류가 발생했습니다'}
                </h2>

                <p className="text-gray-500 leading-relaxed mb-10 font-medium">
                    {message || (is404
                        ? '요청하신 페이지가 존재하지 않거나 경로가 변경되었을 수 있습니다.'
                        : '서버와 통신 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')}
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 h-14 rounded-2xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-all active:scale-95"
                    >
                        <ChevronLeft size={18} />
                        이전으로
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 shadow-lg shadow-gray-200 transition-all active:scale-95"
                    >
                        <RefreshCcw size={18} />
                        다시 시도
                    </button>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="mt-6 flex items-center justify-center gap-2 w-full h-14 rounded-2xl text-accent font-bold hover:bg-accent/5 transition-all"
                >
                    <Home size={18} />
                    홈으로 돌아가기
                </button>

                <div className="mt-12 pt-8 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-medium">
                        지속적으로 문제가 발생하면 고객센터로 문의해 주세요.
                    </p>
                </div>
            </div>
        </div>
    );
};
