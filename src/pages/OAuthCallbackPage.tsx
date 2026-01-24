import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { jwtDecode } from 'jwt-decode';

export const OAuthCallbackPage = () => {
    const navigate = useNavigate();
    const processedRef = useRef(false);

    useEffect(() => {
        if (processedRef.current) return;
        processedRef.current = true;

        const handleSocialLoginSuccess = async () => {
            try {
                // Refresh Token 쿠키를 이용해 Access Token 재발급 요청
                const response = await axiosInstance.post('/api/v1/users/reissue');

                // 공통 응답 객체(CommonResponse)에서 data 추출
                // 구조: { status: 200, data: { accessToken: "..." }, ... }
                // 혹은 { status: 200, data: "accessToken...", ... }
                const responseData = response.data;
                const accessToken = responseData.data?.accessToken || responseData.data;

                if (accessToken && typeof accessToken === 'string') {
                    // 토큰 디코딩 및 스토어 저장 (LocalStorage에도 자동 저장됨)
                    const claims = jwtDecode(accessToken);
                    useAuthStore.getState().setAuth(accessToken, claims);
                    navigate('/');
                } else {
                    throw new Error('Invalid token response');
                }
            } catch (error) {
                console.error('Login processing failed:', error);
                alert('로그인 처리에 실패했습니다. 다시 시도해주세요.');
                navigate('/login');
            }
        };

        handleSocialLoginSuccess();
    }, [navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black mx-auto"></div>
                <p className="text-lg font-medium text-gray-600">로그인 최적화 중...</p>
            </div>
        </div>
    );
};
