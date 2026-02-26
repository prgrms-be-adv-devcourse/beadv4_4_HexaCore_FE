// For API responses regarding option management
export interface GroupDto {
    id: number;
    name: string;
}

export interface ValueDto {
    id: number;
    name: string;
}

export interface OptionGroupResponse {
    group: GroupDto;
    values: ValueDto[];
}

// 상품 개별 옵션 정보
export interface ProductOption {
    productOptionValueId: number;
    groupName: string;
    value: string;
}

// 상품 사이즈별 정보 (개별 재고, 옵션, 이미지 등)
export interface ProductResponse {
    productId: number;
    inventory: number;
    options: ProductOption[];
    imageUrls: string[];
}

// 상품 공통 상세 정보 (백엔드 ProductInfoDto.java와 일치)
export interface ProductInfoDto {
    productInfoId: number;
    brand: BrandResponse; // 백엔드 ProductInfoDto.java의 brand 필드
    category: CategoryResponse; // 백엔드 ProductInfoDto.java의 category 필드
    name: string; // 백엔드 ProductInfoDto.java의 name 필드
    code: string; // 백엔드 ProductInfoDto.java의 code 필드 (프론트엔드 modelNumber에 해당)
    releasePrice: number;
    releaseDate: string;
    // 백엔드 ProductInfoDto.java에는 이미지 관련 필드가 없음
}

// 상품 상세 페이지 전체 API 응답 DTO (백엔드 ProductResponseDto와 일치)
export interface ProductDetailResponse {
    product: { // This is ProductDetailDto
        productInfo: ProductInfoDto;
        products: ProductResponse[]; // This is where the variants actually are!
    };
}

export interface ProductListResponse {
    productInfoId: number;
    productName: string;
    brandName: string;
    categoryName: string;
    thumbnailUrl: string;
    modelNumber?: string;
    releasePrice: number;
    lowestAskPrice?: number | null;
    highestBidPrice?: number | null;
}

export interface CategoryResponse {
    categoryId: number;
    name: string;
    imageUrl?: string;
}

export interface BrandResponse {
    brandId: number;
    name: string;
    imageUrl?: string;
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
    minPrice?: number;
    maxPrice?: number;
}

// --- 상품 생성 및 수정 요청 타입 ---

export interface ProductInfoCreateRequest {
    brandId: number;
    categoryId: number;
    name: string;
    code: string;
    releasePrice: number;
    releasedDate: string; // ISO 8601 format
}

export interface ProductVariantCreateRequest {
    optionValueIds: number[];
    inventory: number;
    imageUrls: string[];
}

export interface ProductCreateRequest {
    productInfo: ProductInfoCreateRequest;
    variants: ProductVariantCreateRequest[];
}

export interface ProductInfoUpdateRequest {
    brandId: number;
    categoryId: number;
    name: string;
    code: string;
    releasePrice: number;
    releasedDate: string;
}

export interface ProductVariantUpdateRequest {
    productId?: number; // 기존 variant를 수정할 때 필요
    optionValueIds: number[];
    inventory: number;
    imageUrls: string[];
}

export interface ProductUpdateRequest {
    productInfo: ProductInfoUpdateRequest;
    variants: ProductVariantUpdateRequest[];
}