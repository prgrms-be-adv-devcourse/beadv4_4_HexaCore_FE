import axiosInstance from './axios';

export interface WalletBalanceResponse {
    walletId: number;
    balance: number;
    lastModifiedAt: string;
}

export const getWalletBalance = async () => {
    const response = await axiosInstance.get<any>('/api/v1/cash/me/wallet/balance');
    return response.data?.data || response.data;
};

export const confirmTossPayment = async (paymentKey: string, orderId: string, amount: number) => {
    const response = await axiosInstance.post('/api/v1/cash/payments/confirm/toss', {
        paymentKey,
        orderId,
        amount
    });
    return response.data;
};

export const failTossPayment = async (orderId: string, code: string, message: string) => {
    const response = await axiosInstance.post('/api/v1/cash/payments/fail/toss', {
        orderId,
        code,
        message
    });
    return response.data;
};
