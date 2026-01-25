import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

// 기본 백엔드 API URL 설정
const BASE_URL = import.meta.env.VITE_API_URL || '/';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 5000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: 모든 요청에 Access Token 주입
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: 401 에러(토큰 만료) 처리
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // 토큰 재발급(Reissue) 요청
                // HttpOnly Cookie를 사용하므로 refreshToken을 body에 보낼 필요 없음
                // withCredentials: true를 설정하여 쿠키가 서버로 전송되도록 함
                const response = await axios.post(
                    `${BASE_URL}/api/v1/users/reissue`,
                    {},
                    { withCredentials: true }
                );

                // 백엔드에서 반환된 새로운 Access Token (Service 코드의 return 값)
                const newAccessToken = response.data?.accessToken || response.data;

                // 새 Access Token 저장
                localStorage.setItem('accessToken', newAccessToken);

                // 원래 요청에 새 토큰 적용
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // 원래 요청 재시도
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                // 리프레시 토큰 만료되거나 재발급 실패 시 로그아웃
                localStorage.removeItem('accessToken');

                // 쿠키는 클라이언트에서 삭제 불가능하므로(HttpOnly), 서버 측 로그아웃 API 호출 등이 필요할 수 있음
                window.location.href = '/login';

                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
