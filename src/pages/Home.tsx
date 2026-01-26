import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { getProducts, getCategories } from '../api/product';
import type { ProductListResponse, CategoryResponse } from '../types/product';
import { Loader2, AlertCircle } from 'lucide-react';

export const Home = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<ProductListResponse[]>([]);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState("전체");
    const [searchKeyword, setSearchKeyword] = useState('');
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [productResponse, categoryResponse] = await Promise.all([
                    getProducts({ page: 0, size: 8, sort: 'LATEST' }),
                    getCategories()
                ]);
                setProducts(productResponse.products);
                setTotalElements(productResponse.totalElements);
                // "전체" 카테고리를 맨 앞에 추가
                setCategories([{ categoryId: 0, name: "전체" }, ...categoryResponse]);
            } catch (err) {
                setError('데이터를 불러오는 데 실패했습니다.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchKeyword.trim()) {
            navigate(`/shop?keyword=${searchKeyword}`);
        }
    };

    const handleCategoryClick = (category: string) => {
        setActiveCategory(category);
        navigate(`/shop?categoryName=${category === '전체' ? '' : category}`);
    }

    return (
        <div className="min-h-screen bg-white font-sans">
            <section className="relative flex h-[600px] flex-col items-center justify-center pt-[60px] text-center bg-gradient-to-tr from-[#e8eaf6] via-[#9fa8da] to-[#5c6bc0] overflow-hidden">
                <div className="absolute -top-[100px] -left-[100px] h-[600px] w-[600px] rounded-full bg-white/10" />
                <div className="absolute -bottom-[50px] right-[10%] h-[400px] w-[400px] rounded-full bg-white/10" />

                <div className="relative z-10 w-full max-w-[800px] px-5">
                    <h1 className="mb-5 text-5xl font-extrabold leading-tight text-white drop-shadow-md md:text-6xl">
                        한정판 거래의 새로운 기준
                    </h1>
                    <p className="mb-12 text-xl font-medium text-white/90">
                        안전하고 투명한 입찰 시스템으로 원하는 가격에 거래하세요
                    </p>
                    <form onSubmit={handleSearch}>
                        <SearchBar
                            maxWidth="600px"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                    </form>
                </div>
            </section>

            <div className="sticky top-[60px] z-[50] border-b border-[#eee] bg-white py-4">
                <ul className="flex justify-center gap-4 m-0 p-0 list-none">
                    {categories.map(cat => (
                        <li key={cat.categoryId}>
                            <button
                                className={`rounded-[20px] border border-solid px-5 py-2 text-sm transition-all duration-200 cursor-pointer
                                    ${activeCategory === cat.name
                                        ? 'bg-white border-[#5c6bc0]/40 text-[#333] font-bold shadow-[0_2px_8px_rgba(92,107,192,0.2)] -translate-y-[0.5px]'
                                        : 'bg-white border-gray-200 text-[#888] hover:border-gray-300 hover:text-[#333]'
                                    }`}
                                onClick={() => handleCategoryClick(cat.name)}
                            >
                                {cat.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <section className="mx-auto max-w-[1500px] px-10 py-8">
                <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
                    <h3 className="text-2xl font-bold text-[#333]">인기 상품</h3>
                    <a href="/shop" className="text-sm text-accent font-bold hover:underline">더보기</a>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-xl text-red-500">
                        <AlertCircle className="w-8 h-8 mb-4" />
                        <p className="font-bold">{error}</p>
                    </div>
                ) : (
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
                )}
            </section>
        </div>
    );
};
