import axiosInstance from './axios';

export const getBuyNowPrice = async (productId: number) => {
    const response = await axiosInstance.get(`/api/v1/market/products/${productId}/buy-now-price`);
    return response.data;
};

export const getSellNowPrice = async (productId: number) => {
    const response = await axiosInstance.get(`/api/v1/market/products/${productId}/sell-now-price`);
    return response.data;
};

export const getAllSizePrices = async (productInfoId: number) => {
    const response = await axiosInstance.get(`/api/v1/market/products/${productInfoId}/size-prices`);
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

export const getSellingHistory = async () => {
    const response = await axiosInstance.get('/api/v1/market/orders/selling');
    return response.data;
};

export const getBuyingHistory = async () => {
    const response = await axiosInstance.get('/api/v1/market/orders/buying');
    return response.data;
};

export const getOrderDetail = async (orderId: number) => {
    const response = await axiosInstance.get(`/api/v1/market/orders/${orderId}`);
    return response.data;
};

export const completeOrder = async (orderId: number) => {
    const response = await axiosInstance.patch(`/api/v1/market/orders/${orderId}/complete`);
    return response.data;
};



