import axios from 'axios';

const marketInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_MARKET,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor to inject JWT from localStorage
marketInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getBuyNowPrice = async (productId: number) => {
    const response = await marketInstance.get(`/api/v1/market/products/${productId}/buy-now-price`);
    return response.data;
};

export const getSellNowPrice = async (productId: number) => {
    const response = await marketInstance.get(`/api/v1/market/products/${productId}/sell-now-price`);
    return response.data;
};

export const registerBuyBid = async (productId: number, price: number, size: string) => {
    const response = await marketInstance.post('/api/v1/market/bids/buy', { productId, price, size });
    return response.data;
};

export const registerSellBid = async (productId: number, price: number, size: string) => {
    const response = await marketInstance.post('/api/v1/market/bids/sell', { productId, price, size });
    return response.data;
};
