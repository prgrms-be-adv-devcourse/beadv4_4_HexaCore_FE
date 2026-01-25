import axiosInstance from './axios';

export const getBuyNowPrice = async (productId: number) => {
    const response = await axiosInstance.get(`/api/v1/market/products/${productId}/buy-now-price`);
    return response.data;
};

export const getSellNowPrice = async (productId: number) => {
    const response = await axiosInstance.get(`/api/v1/market/products/${productId}/sell-now-price`);
    return response.data;
};

export const registerBuyBid = async (productId: number, price: number, size: string) => {
    const response = await axiosInstance.post('/api/v1/market/bids/buy', { productId, price, size });
    return response.data;
};

export const registerSellBid = async (productId: number, price: number, size: string) => {
    const response = await axiosInstance.post('/api/v1/market/bids/sell', { productId, price, size });
    return response.data;
};

export const buyNow = async (productId: number, price: number, size: string) => {
    const response = await axiosInstance.post('/api/v1/market/buy-now', { productId, price, size });
    return response.data;
};

export const sellNow = async (productId: number, price: number, size: string) => {
    const response = await axiosInstance.post('/api/v1/market/sell-now', { productId, price, size });
    return response.data;
};
