export interface ProductInfoResponse {
    productInfoId: number;
    name: string;
    brandName: string;
    categoryName: string;
    imageUrl: string;
    modelNumber: string;
    releasePrice: number;
    releaseDate: string;
    products: ProductResponse[]; // Array of product variants
    productOptionValues: ProductOptionValueResponse[];
    productImages: ProductImageResponse[];
}

export interface ProductOptionValueResponse {
    productOptionValueId: number;
    productOptionId: number;
    productOptionName: string; // 예: "색상" 또는 "사이즈"
    value: string; // 예: "Red" 또는 "270"
}

export interface ProductImageResponse {
    productImageId: number;
    productInfoId: number;
    url: string;
    sortOrder: number;
}

export interface ProductResponse {
    productId: number;
    productInfoId: number;
    size: string; // 실제 Product의 사이즈 (예: "270")
    // 기타 Product 관련 정보 (예: 재고 등, API 명세에 따라 추가)
}

export interface ProductListResponse {
    productInfoId: number;
    productName: string;
    brandName: string;
    categoryName: string;
    thumbnailUrl: string;
    modelNumber: string;
    releasePrice: number;
    lowestAskPrice: number | null;
    highestBidPrice: number | null;
}

export interface CategoryResponse {
    categoryId: number;
    name: string;
}

export interface BrandResponse {
    brandId: number;
    name: string;
}

// 공통 PageResponse 타입 (settlement.ts에서 가져옴)
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// 상품 목록 조회 응답 (페이지네이션 포함)
export interface PaginatedProductList {
    products: ProductListResponse[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
}

// 상품 목록 조회 필터
export interface ProductFilter {
    page?: number;
    size?: number;
    searchKeyword?: string;
    brandIds?: number[];
    categoryIds?: number[];
    excludeSoldOut?: boolean;
    sort?: string; // 예: 'LATEST', 'PRICE_LOW'
}
