import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../api/product';
import type { ProductListResponse } from '../../types/product';
import { ChevronLeft, Edit, Trash2, Loader2, Plus } from 'lucide-react';

export const AdminProductList = () => {
    const [products, setProducts] = useState<ProductListResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            // A large size to fetch "all" products for this admin page.
            // Consider implementing proper pagination if the product list grows very large.
            const productData = await getProducts({ size: 999, sort: 'LATEST' });
            setProducts(productData.products);
        } catch (err) {
            setError('상품 목록을 불러오는 데 실패했습니다.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleEdit = (productInfoId: number) => {
        navigate(`/admin/product/${productInfoId}`);
    };
    
    const handleCreate = () => {
        navigate('/admin/product');
    };

    const handleDelete = async (productInfoId: number, productName: string) => {
        if (window.confirm(`정말로 '${productName}' 상품을 삭제하시겠습니까?`)) {
            try {
                await deleteProduct(productInfoId);
                alert('상품이 삭제되었습니다.');
                fetchProducts(); // Refresh the list from the server
            } catch (err) {
                alert('상품 삭제에 실패했습니다.');
                console.error(err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-[100px] pb-24 px-6 font-pretendard">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between gap-4 mb-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft size={24} className="text-gray-600" />
                        </button>
                        <h2 className="text-3xl font-black text-[#333] tracking-tight">상품 목록 관리</h2>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="flex items-center justify-center gap-2 h-12 px-6 bg-gray-900 text-white font-bold rounded-xl shadow-md shadow-gray-900/10 transition-all hover:bg-gray-800 active:scale-[0.98]"
                    >
                        <Plus size={18} /> 새 상품 등록
                    </button>
                </div>
                
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    {isLoading ? (
                        <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-gray-400" /></div>
                    ) : error ? (
                        <div className="text-center text-red-500 p-20">{error}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-200">
                                    <tr className="text-sm text-gray-500">
                                        <th className="px-4 py-4 font-semibold">이미지</th>
                                        <th className="px-4 py-4 font-semibold">상품명</th>
                                        <th className="px-4 py-4 font-semibold">브랜드</th>
                                        <th className="px-4 py-4 font-semibold">카테고리</th>
                                        <th className="px-4 py-4 font-semibold">상품 코드</th>
                                        <th className="px-4 py-4 font-semibold text-right">관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.productInfoId} className="border-b border-gray-100 hover:bg-gray-50/50">
                                            <td className="px-4 py-3">
                                                <img 
                                                    src={product.thumbnailUrl || 'https://via.placeholder.com/64'} 
                                                    alt={product.productName} 
                                                    className="w-16 h-16 object-contain rounded-lg bg-gray-100 p-1"
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-bold text-gray-800">{product.productName}</td>
                                            <td className="px-4 py-3 text-gray-600">{product.brandName}</td>
                                            <td className="px-4 py-3 text-gray-600">{product.categoryName}</td>
                                            <td className="px-4 py-3 font-mono text-sm text-gray-500">{product.modelNumber}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEdit(product.productInfoId)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors" aria-label="Edit">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(product.productInfoId, product.productName)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors" aria-label="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {products.length === 0 && (
                                <p className="text-center text-gray-500 py-20">등록된 상품이 없습니다.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
