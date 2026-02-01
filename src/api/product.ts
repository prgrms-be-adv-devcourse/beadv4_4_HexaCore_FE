import axiosInstance from './axios';
import type {
    BrandResponse,
    CategoryResponse,
    PaginatedProductList,
    ProductFilter,
    ProductDetailResponse, ProductCreateRequest, ProductUpdateRequest, OptionGroupResponse
} from '../types/product';

// URL 쿼리 파라미터 생성 헬퍼
const buildUrl = (endpoint: string, params: Record<string, unknown>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        // null 또는 undefined가 아닌 값만 파라미터에 추가
        if (value !== undefined && value !== null) {
            // 배열인 경우 쉼표로 구분된 문자열로 변환 (빈 배열도 빈 문자열로 포함)
            if (Array.isArray(value)) {
                searchParams.append(key, value.join(','));
            } else {
                searchParams.append(key, String(value));
            }
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `${endpoint}?${queryString}` : endpoint;
};

// 상품 목록 조회 (페이지네이션, 필터링, 검색 포함)
export const getProducts = async (filter: ProductFilter = {}): Promise<PaginatedProductList> => {
    const {
        page = 0,
        size = 20,
        sort = 'LATEST',
        brandIds = [], // 기본값을 빈 배열로 설정
        categoryIds = [], // 기본값을 빈 배열로 설정
        excludeSoldOut = false,
        searchKeyword,
    } = filter;

    // 백엔드 DTO에 맞는 파라미터 객체 생성
    const params = {
        page,
        size,
        sort,
        brandIds,
        categoryIds,
        excludeSoldOut,
        keyword: searchKeyword,
    };

    const url = buildUrl('/api/v1/products', params);
    const response = await axiosInstance.get(url);
    // 백엔드 CommonResponse 구조에 따라 실제 데이터는 response.data.data 에 있음
    return response.data.data;
};

// 상품 상세 조회
export const getProductDetail = async (productInfoId: number): Promise<ProductDetailResponse> => {
    const response = await axiosInstance.get(`/api/v1/products/${productInfoId}`);
    return response.data.data;
};

// 브랜드 목록 조회
export const getBrands = async (): Promise<BrandResponse[]> => {
    const response = await axiosInstance.get('/api/v1/products/brands');
    return response.data.data.brands;
};

// 카테고리 목록 조회
export const getCategories = async (): Promise<CategoryResponse[]> => {
    const response = await axiosInstance.get('/api/v1/products/categories');
    return response.data.data.categories;
};

// 상품 생성
export const createProduct = async (productData: ProductCreateRequest): Promise<ProductDetailResponse> => {
    const response = await axiosInstance.post('/api/v1/products', productData);
    return response.data.data;
};

// 상품 수정
export const updateProduct = async (productInfoId: number, productData: ProductUpdateRequest): Promise<ProductDetailResponse> => {
    const response = await axiosInstance.put(`/api/v1/products/${productInfoId}`, productData);
    return response.data.data;
};

// 상품 옵션 목록 조회

export const getOptions = async (): Promise<OptionGroupResponse[]> => {
    const response = await axiosInstance.get('/api/v1/products/options');
    const optionsData = response.data.data.options; 

    if (!Array.isArray(optionsData)) {
        return []; 
    }

    return optionsData.map((item: any) => ({
        id: item.group.id,
        name: item.group.name,
        optionValues: item.values.map((v: any) => ({
            id: v.id,
            value: v.name, 
        })),
    }));
};



// --- 브랜드 관리 API ---



// 브랜드 생성

export const createBrand = async (brandData: { name: string; logoUrl?: string }) => {

    // API는 배열을 받으므로 배열로 감싸서 전송

    const response = await axiosInstance.post('/api/v1/products/brands', {

        brands: [brandData]

    });

    return response.data;

};



// 브랜드 수정

export const updateBrand = async (brandId: number, brandData: { name: string; imageUrl: string }) => {

    const response = await axiosInstance.put(`/api/v1/products/brands/${brandId}`, brandData);

    return response.data;

};



// 브랜드 삭제

export const deleteBrand = async (brandId: number) => {

    const response = await axiosInstance.delete(`/api/v1/products/brands/${brandId}`);

    return response.data;

};

// --- 카테고리 관리 API ---

// 카테고리 생성
export const createCategory = async (categoryData: { name: string; imageUrl?: string }) => {
    // API는 배열을 받으므로 배열로 감싸서 전송
    const response = await axiosInstance.post('/api/v1/products/categories', {
        categories: [categoryData]
    });
    return response.data;
};

// 카테고리 수정
export const updateCategory = async (categoryId: number, categoryData: { name: string; imageUrl: string }) => {
    const response = await axiosInstance.put(`/api/v1/products/categories/${categoryId}`, categoryData);
    return response.data;
};

// 카테고리 삭제
export const deleteCategory = async (categoryId: number) => {
    const response = await axiosInstance.delete(`/api/v1/products/categories/${categoryId}`);
    return response.data;
};

// --- 상품 옵션 관리 API ---

// 옵션 그룹 및 포함된 값 생성 (POST /api/v1/products/options)
export const createOptionGroup = async (data: { name: string; optionValues: string[] }) => {
    // OptionCreateRequestDto: { options: [ { group, values } ] }
    const payload = {
        options: [{
            group: data.name,
            values: data.optionValues
        }]
    };
    const response = await axiosInstance.post('/api/v1/products/options', payload);
    return response.data;
};

// 옵션 그룹 이름 수정 (PUT /api/v1/products/options/groups/{optionGroupId})
export const updateOptionGroupName = async (optionGroupId: number, data: { name: string }) => {
    // OptionGroupModifyRequestDto: { name }
    const response = await axiosInstance.put(`/api/v1/products/options/groups/${optionGroupId}`, data);
    return response.data;
};

// 옵션 그룹 삭제 (DELETE /api/v1/products/options/groups/{optionGroupId})
export const deleteOptionGroup = async (optionGroupId: number) => {
    const response = await axiosInstance.delete(`/api/v1/products/options/groups/${optionGroupId}`);
    return response.data;
};

// 기존 옵션 그룹에 값 추가 (POST /api/v1/products/options/{optionGroupId})
export const appendOptionValues = async (optionGroupId: number, data: { optionValues: string[] }) => {
    // OptionAppendRequestDto: { values }
    const payload = { values: data.optionValues };
    const response = await axiosInstance.post(`/api/v1/products/options/${optionGroupId}`, payload);
    return response.data;
};

// 옵션 값 수정 (PUT /api/v1/products/options/values/{optionValueId})
export const updateOptionValue = async (optionValueId: number, data: { optionGroupId: number; name: string }) => {
    // OptionValueModifyRequestDto: { optionGroupId, name }
    const response = await axiosInstance.put(`/api/v1/products/options/values/${optionValueId}`, data);
    return response.data;
};

// 옵션 값 삭제 (DELETE /api/v1/products/options/values/{optionValueId})
export const deleteOptionValue = async (optionValueId: number) => {
    const response = await axiosInstance.delete(`/api/v1/products/options/values/${optionValueId}`);
    return response.data;
};
