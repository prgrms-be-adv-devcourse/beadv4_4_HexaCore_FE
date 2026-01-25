import axiosInstance from './axios';

export const confirmTossPayment = async (paymentKey: string, orderId: string, amount: number) => {
    const response = await axiosInstance.post('/api/v1/cash/payments/confirm/toss', {
        paymentKey,
        orderId,
        amount
    });
    return response.data;
};
