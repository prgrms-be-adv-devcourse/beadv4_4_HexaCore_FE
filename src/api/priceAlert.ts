import axiosInstance from './axios';

export interface PriceAlertSaveRequestDto {
    targetPrice: number;
    productId: number;
}

export interface PriceAlertIdDto {
    priceAlertId: number;
}

export const savePriceAlert = async (dto: PriceAlertSaveRequestDto) => {
    const response = await axiosInstance.post<PriceAlertIdDto>('/api/v1/price-alerts', dto);
    return response.data;
};

export interface PriceAlertResponseDto {
    id: number;
    productId: number;
    targetPrice: number;
    triggeredAt: string | null;
    createdAt: string;
    productDetail?: {
        productInfo: {
            brand: {
                brandId: number;
                imageUrl: string;
                name: string;
            };
            category: {
                categoryId: number;
                imageUrl: string;
                name: string;
            };
            code: string;
            name: string;
            productInfoId: number;
            releaseDate: string;
            releasePrice: number;
        };
        products: Array<{
            imageUrls: string[];
            inventory: number;
            options: Array<{
                group: {
                    id: number;
                    name: string;
                };
                values: Array<{
                    id: number;
                    name: string;
                }>;
            }>;
            productId: number;
        }>;
    };
}

export const getPriceAlerts = async () => {
    const response = await axiosInstance.get<any>('/api/v1/price-alerts');
    return response.data?.data || response.data;
};

export const deletePriceAlert = async (priceAlertId: number) => {
    const response = await axiosInstance.delete(`/api/v1/price-alerts/${priceAlertId}`);
    return response.data;
};
