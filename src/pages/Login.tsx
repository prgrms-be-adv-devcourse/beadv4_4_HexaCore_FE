import { Mail } from 'lucide-react';
import { Logo } from '../components/Logo';

export const Login = () => {
    const handleLogin = (provider: string) => {
        console.log(`Login with ${provider}`);
        // Login logic will be implemented here
    };

    return (
        <div className="relative flex min-h-[calc(100vh-140px)] items-center justify-center overflow-hidden bg-[#fbfbfb] px-5 py-20 font-pretendard">
            {/* Background Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-5%] h-[400px] w-[400px] rounded-full bg-accent/5 blur-[80px]" />
            <div className="absolute bottom-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-[#8e24aa]/5 blur-[80px]" />

            <div className="relative z-10 w-full max-w-[420px] rounded-[24px] bg-white p-10 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-[#f0f0f0]">
                {/* Logo Section */}
                <div className="mb-10 text-center">
                    <div className="mb-2">
                        <Logo size="xl" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">당신의 취향을 정하는 새로운 기준</p>
                </div>

                {/* Social Login Section */}
                <div className="flex flex-col gap-3">
                    <button
                        className="group relative flex h-14 w-full items-center justify-center rounded-xl bg-[#03C75A] text-[15px] font-bold text-white transition-all hover:bg-[#02b351] hover:shadow-md active:scale-[0.98] shadow-sm"
                        onClick={() => handleLogin('Naver')}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="absolute left-6 h-5 w-5">
                            <path d="M16.273 12.845L7.376 0H0v24h7.726V11.155L16.624 24H24V0h-7.727v12.845z" />
                        </svg>
                        네이버로 로그인
                    </button>

                    <button
                        className="group relative flex h-14 w-full items-center justify-center rounded-xl bg-[#FEE500] text-[15px] font-bold text-[#3C1E1E] transition-all hover:bg-[#fdd835] hover:shadow-md active:scale-[0.98] shadow-sm"
                        onClick={() => handleLogin('Kakao')}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="absolute left-6 h-5 w-5">
                            <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.558 1.707 4.8 4.34 6.054l-.84 3.08c-.05.18.06.37.24.43.05.02.1.02.15.02.13 0 .25-.07.32-.19l3.507-2.335c.42.04.85.06 1.283.06 4.97 0 9-3.185 9-7.115S16.97 3 12 3z" />
                        </svg>
                        카카오로 로그인
                    </button>

                    <button
                        className="group relative flex h-14 w-full items-center justify-center rounded-xl border border-gray-400 bg-white text-[15px] font-bold text-[#333] transition-all hover:bg-gray-50 hover:shadow-md active:scale-[0.98] shadow-sm"
                        onClick={() => handleLogin('Google')}
                    >
                        <img
                            src="https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
                            alt="Google"
                            className="absolute left-6 h-5 w-5"
                        />
                        Google로 로그인
                    </button>
                </div>

                {/* Footer Links */}
                <div className="mt-10 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="h-[1px] w-8 bg-gray-100" />
                        또는 이메일로 로그인
                        <span className="h-[1px] w-8 bg-gray-100" />
                    </div>

                    <button
                        className="flex items-center gap-2 text-[14px] font-semibold text-[#5c6bc0] hover:underline"
                        onClick={() => handleLogin('Email')}
                    >
                        <Mail size={16} />
                        이메일 주소 사용하기
                    </button>

                    <div className="flex gap-4 text-xs text-gray-400">
                        <button className="hover:text-gray-600 transition-colors">이메일 가입</button>
                        <span className="h-3 w-[1px] bg-gray-200" />
                        <button className="hover:text-gray-600 transition-colors">이메일 찾기</button>
                        <span className="h-3 w-[1px] bg-gray-200" />
                        <button className="hover:text-gray-600 transition-colors">비밀번호 찾기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
