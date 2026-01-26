import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react';
import { getProducts, getBrands, getCategories } from '../api/product';
import type {
    ProductListResponse,
    BrandResponse,
    CategoryResponse
} from '../types/product';
import debounce from 'lodash.debounce';

export const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<ProductListResponse[]>([]);
    const [brands, setBrands] = useState<BrandResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
        searchParams.get('category') ? Number(searchParams.get('category')) : null
    );

    const [activeBrandId, setActiveBrandId] = useState<number | null>(
        searchParams.get('brand') ? Number(searchParams.get('brand')) : null
    );

    const [searchKeyword, setSearchKeyword] = useState(
        searchParams.get('keyword') || ''
    );

    const [isBrandExpanded, setIsBrandExpanded] = useState(true);
    const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);

    const fetchProducts = useCallback(async (filters: {
        page: number;
        keyword?: string;
        brandId?: number | null;
        categoryId?: number | null;
    }) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getProducts({
                page: filters.page,
                size: 20,
                searchKeyword: filters.keyword,
                brandIds: filters.brandId ? [filters.brandId] : [],
                categoryIds: filters.categoryId ? [filters.categoryId] : [],
            });
            setProducts(response.products);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (err) {
            setError('상품을 불러오는 데 실패했습니다.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const debouncedFetch = useCallback(
        debounce(fetchProducts, 300),
        [fetchProducts]
    );

    useEffect(() => {
        const filters = {
            page,
            keyword: searchKeyword,
            brandId: activeBrandId,
            categoryId: activeCategoryId
        };
        // Trigger fetch for page, brand, category, and keyword changes
        fetchProducts(filters);

        const newSearchParams = new URLSearchParams();
        if (searchKeyword) newSearchParams.set('keyword', searchKeyword);
        if (activeBrandId) newSearchParams.set('brand', String(activeBrandId));
        if (activeCategoryId) newSearchParams.set('category', String(activeCategoryId));
        setSearchParams(newSearchParams, { replace: true });

    }, [page, searchKeyword, activeBrandId, activeCategoryId, fetchProducts, setSearchParams]);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [brandsData, categoriesData] = await Promise.all([
                    getBrands(),
                    getCategories()
                ]);
                setBrands(brandsData);
                setCategories(categoriesData);
            } catch (err) {
                console.error("Failed to fetch filters", err);
            }
        };
        fetchFilters();
    }, []);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPage(0);
        fetchProducts({
            page: 0,
            keyword: searchKeyword,
            brandId: activeBrandId,
            categoryId: activeCategoryId
        });
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="pt-[80px] pb-10 bg-white border-b border-[#f0f0f0]">
                <form onSubmit={handleSearch}>
                    <SearchBar
                        placeholder="브랜드, 상품명으로 검색"
                        value={searchKeyword}
                        onChange={(e) => {
                            setSearchKeyword(e.target.value);
                        }}
                    />
                </form>
            </div>

            <div className="flex w-full gap-10 py-8 px-16 max-md:flex-col max-md:px-5">
                <aside className="flex w-[260px] flex-shrink-0 flex-col gap-6 max-md:w-full max-md:gap-2">
                    {/* Brand Filter */}
                    <div className="border-b border-gray-100 pb-4 max-md:border-none max-md:pb-0">
                        <button
                            className="flex w-full items-center justify-between py-2 text-left md:pointer-events-none md:mb-4"
                            onClick={() => setIsBrandExpanded(!isBrandExpanded)}
                        >
                            <h3 className="text-base font-bold text-black font-pretendard">브랜드</h3>
                            <div className="md:hidden">
                                {isBrandExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </button>
                        <ul className={`flex flex-col gap-1 list-none p-0 m-0 overflow-hidden transition-all duration-300 ${isBrandExpanded
                                ? 'max-md:max-h-[500px] max-md:opacity-100 max-md:mt-2'
                                : 'max-md:max-h-0 max-md:opacity-0'
                            }`}>
                            <li>
                                <button
                                    className={`w-full py-2.5 px-4 text-left text-[0.9rem] transition-all duration-200 rounded-lg cursor-pointer font-pretendard ${!activeBrandId
                                            ? 'bg-accent/10 text-accent font-bold'
                                            : 'bg-transparent text-[#555] hover:bg-gray-50 hover:text-[#333]'
                                        }`}
                                    onClick={() => { setActiveBrandId(null); setPage(0); }}
                                >
                                    전체
                                </button>
                            </li>
                            {brands.map(brand => (
                                <li key={brand.brandId}>
                                    <button
                                        className={`w-full py-2.5 px-4 text-left text-[0.9rem] transition-all duration-200 rounded-lg cursor-pointer font-pretendard ${activeBrandId === brand.brandId
                                                ? 'bg-accent/10 text-accent font-bold'
                                                : 'bg-transparent text-[#555] hover:bg-gray-50 hover:text-[#333]'
                                            }`}
                                        onClick={() => { setActiveBrandId(brand.brandId); setPage(0); }}
                                    >
                                        {brand.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Category Filter */}
                    <div className="border-b border-gray-100 pb-4 max-md:border-none max-md:pb-0">
                        <button
                            className="flex w-full items-center justify-between py-2 text-left md:pointer-events-none md:mb-4"
                            onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                        >
                            <h3 className="text-base font-bold text-black font-pretendard">카테고리</h3>
                            <div className="md:hidden">
                                {isCategoryExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </button>
                        <ul className={`flex flex-col gap-1 list-none p-0 m-0 overflow-hidden transition-all duration-300 ${isCategoryExpanded
                                ? 'max-md:max-h-[500px] max-md:opacity-100 max-md:mt-2'
                                : 'max-md:max-h-0 max-md:opacity-0'
                            }`}>
                            <li>
                                <button
                                    className={`w-full py-2.5 px-4 text-left text-[0.9rem] transition-all duration-200 rounded-lg cursor-pointer font-pretendard ${!activeCategoryId
                                            ? 'bg-accent/10 text-accent font-bold'
                                            : 'bg-transparent text-[#555] hover:bg-gray-50 hover:text-[#333]'
                                        }`}
                                    onClick={() => { setActiveCategoryId(null); setPage(0); }}
                                >
                                    전체
                                </button>
                            </li>
                            {categories.map(cat => (
                                <li key={cat.categoryId}>
                                    <button
                                        className={`w-full py-2.5 px-4 text-left text-[0.9rem] transition-all duration-200 rounded-lg cursor-pointer font-pretendard ${activeCategoryId === cat.categoryId
                                                ? 'bg-accent/10 text-accent font-bold'
                                                : 'bg-transparent text-[#555] hover:bg-gray-50 hover:text-[#333]'
                                            }`}
                                        onClick={() => { setActiveCategoryId(cat.categoryId); setPage(0); }}
                                    >
                                        {cat.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                <section className="flex-1 px-5">
                    <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
                        <h3 className="text-2xl font-bold text-[#333] font-pretendard">전체 상품</h3>
                        <span className="text-sm text-[#888] font-pretendard">
                            {(totalElements || 0).toLocaleString()}개 상품
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-96">
                            <Loader2 className="w-10 h-10 animate-spin text-accent" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-96 bg-red-50 rounded-xl text-red-500">
                            <AlertCircle className="w-10 h-10 mb-4" />
                            <p className="font-bold">{error}</p>
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="grid grid-cols-[repeat(auto-fill,250px)] justify-center gap-5">
                                {products.map(product => (
                                    <ProductCard
                                        key={product.productInfoId}
                                        id={String(product.productInfoId)}
                                        brand={product.brandName}
                                        name={product.productName}
                                        price={product.lowestAskPrice || product.releasePrice}
                                        imageUrl={product.thumbnailUrl}
                                    />
                                ))}
                            </div>
                            {/* Pagination can be added here based on `page` and `totalPages` */}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-xl text-gray-500">
                            <p className="font-bold">검색 결과가 없습니다.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};