import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../../api/product';
import type { BrandResponse } from '../../types/product';
import { ChevronLeft, Plus, Trash2, Edit, X, Loader2, Image as ImageIcon } from 'lucide-react';

// Reusable Components matching project style
const FormCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-white rounded-2xl p-8 border border-gray-100 shadow-sm ${className}`}>
        <h3 className="text-xl font-bold text-[#333] mb-8 pb-4 border-b border-gray-100">{title}</h3>
        {children}
    </div>
);

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="text-sm font-bold text-gray-500 mb-2 block">{label}</label>
        {children}
    </div>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 font-medium text-[#333] transition"
    />
);

const PrimaryButton: React.FC<{ children: React.ReactNode, onClick?: () => void, type?: 'button'|'submit', disabled?: boolean }> = ({ children, ...props }) => (
    <button
        {...props}
        className="h-14 w-full bg-gray-900 text-white font-bold rounded-xl shadow-md shadow-gray-900/10 transition-all hover:bg-gray-800 active:scale-[0.98] disabled:bg-gray-300 disabled:shadow-none"
    >
        {children}
    </button>
);

interface BrandFormData {
    name: string;
    logoUrl: string;
}

export const AdminBrandManagement = () => {
    const navigate = useNavigate();

    const [brands, setBrands] = useState<BrandResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedBrand, setSelectedBrand] = useState<BrandResponse | null>(null);
    const [formData, setFormData] = useState<BrandFormData>({ name: '', logoUrl: '' });

    const fetchBrands = useCallback(async () => {
        setIsLoading(true);
        try {
            const brandsData = await getBrands();
            setBrands(brandsData);
        } catch (err) {
            setError('브랜드 목록을 불러오는 데 실패했습니다.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    useEffect(() => {
        if (selectedBrand) {
            setFormData({
                name: selectedBrand.name,
                logoUrl: selectedBrand.logoUrl || ''
            });
        } else {
            setFormData({ name: '', logoUrl: '' });
        }
    }, [selectedBrand]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            alert('브랜드 이름을 입력해주세요.');
            return;
        }
        setIsSubmitting(true);
        try {
            if (selectedBrand) {
                // Update
                await updateBrand(selectedBrand.brandId, { name: formData.name, logoUrl: formData.logoUrl });
                alert('브랜드가 수정되었습니다.');
            } else {
                // Create
                await createBrand({ name: formData.name, logoUrl: formData.logoUrl });
                alert('브랜드가 생성되었습니다.');
            }
            setSelectedBrand(null);
            setFormData({ name: '', logoUrl: '' });
            await fetchBrands(); // Refresh list
        } catch (err) {
            alert(`오류가 발생했습니다: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (brandId: number) => {
        if (window.confirm('정말로 이 브랜드를 삭제하시겠습니까?')) {
            try {
                await deleteBrand(brandId);
                alert('브랜드가 삭제되었습니다.');
                await fetchBrands();
            } catch (err) {
                alert('브랜드 삭제에 실패했습니다.');
            }
        }
    };

    const handleSelectBrand = (brand: BrandResponse) => {
        setSelectedBrand(brand);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const clearSelection = () => {
        setSelectedBrand(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-[100px] pb-24 px-6 font-pretendard">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="text-3xl font-black text-[#333] tracking-tight">브랜드 관리</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Left: Form */}
                    <div className="md:col-span-1 md:sticky md:top-28">
                         <form onSubmit={handleFormSubmit}>
                            <FormCard title={selectedBrand ? '브랜드 수정' : '새 브랜드 추가'}>
                                <div className="space-y-6">
                                    <FormField label="브랜드 이름">
                                        <StyledInput name="name" value={formData.name} onChange={handleInputChange} required />
                                    </FormField>
                                    <FormField label="로고 이미지 URL (선택)">
                                        <StyledInput name="logoUrl" type="url" placeholder="https://example.com/logo.png" value={formData.logoUrl} onChange={handleInputChange} />
                                    </FormField>
                                    <div className="flex flex-col gap-3 pt-4">
                                       <PrimaryButton type="submit" disabled={isSubmitting}>
                                            {isSubmitting 
                                                ? <Loader2 className="animate-spin mx-auto" />
                                                : selectedBrand ? '수정하기' : '추가하기'
                                            }
                                        </PrimaryButton>
                                        {selectedBrand && (
                                            <button type="button" onClick={clearSelection} className="text-sm text-gray-500 hover:text-black">
                                                + 새 브랜드 추가
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </FormCard>
                        </form>
                    </div>

                    {/* Right: List */}
                    <div className="md:col-span-2">
                        <FormCard title="브랜드 목록">
                            {isLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                            ) : error ? (
                                <div className="text-center text-red-500 p-8">{error}</div>
                            ) : (
                                <div className="space-y-3">
                                    {brands.map(brand => (
                                        <div key={brand.brandId} className="flex items-center justify-between bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
                                            <div className="flex items-center gap-4">
                                                {brand.logoUrl ? (
                                                    <img src={brand.logoUrl} alt={brand.name} className="w-10 h-10 object-contain rounded-md" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                                        <ImageIcon size={20} className="text-gray-400"/>
                                                    </div>
                                                )}
                                                <span className="font-bold text-gray-800">{brand.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleSelectBrand(brand)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(brand.brandId)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {brands.length === 0 && (
                                        <p className="text-center text-gray-500 py-8">등록된 브랜드가 없습니다.</p>
                                    )}
                                </div>
                            )}
                        </FormCard>
                    </div>
                </div>
            </div>
        </div>
    );
};
