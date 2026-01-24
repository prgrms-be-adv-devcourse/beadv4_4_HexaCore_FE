import axios from 'axios';

const cashInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_CASH,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
cashInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const confirmTossPayment = async (paymentKey: string, orderId: string, amount: number) => {
    const response = await cashInstance.post('/api/v1/cash/payments/confirm/toss', {
        paymentKey,
        orderId,
        amount
    });
    return response.data;
};
