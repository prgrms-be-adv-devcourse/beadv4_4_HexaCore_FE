import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getBrands,
    getCategories,
    getOptions,
    getProductDetail,
    createProduct,
    updateProduct,
} from '../../api/product';
import type {
    BrandResponse as Brand,
    CategoryResponse as Category,
    OptionGroupResponse,
    ProductCreateRequest,
    ProductUpdateRequest,
} from '../../types/product';
import {
    ChevronLeft, Plus, Trash2, Image as ImageIcon, X, Loader2
} from 'lucide-react';

// Form State에 맞는 로컬 타입 정의
interface FormProductInfo {
    brandId: number | '';
    categoryId: number | '';
    name: string;
    code: string;
    releasePrice: number;
    releasedDate: string;
}

interface FormVariantData {
    productId?: number;
    optionValueIds: number[];
    inventory: number;
    imageUrls: string[];
}

interface FormState {
    productInfo: FormProductInfo;
    variants: FormVariantData[];
}

// Reusable Components matching project style
const FormCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
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

const StyledSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
        {...props}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 font-medium text-[#333] transition appearance-none bg-no-repeat bg-right"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.7rem center',
            backgroundSize: '1.2em 1.2em'
        }}
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

export const AdminProductManagement = () => {
    const { productInfoId } = useParams<{ productInfoId: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(productInfoId);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<FormState>({
        productInfo: { brandId: '', categoryId: '', name: '', code: '', releasePrice: 0, releasedDate: '' },
        variants: [],
    });

    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [groupedOptions, setGroupedOptions] = useState<OptionGroupResponse[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [brandsData, categoriesData, optionsData] = await Promise.all([
                    getBrands(), getCategories(), getOptions(),
                ]);
                setBrands(brandsData);
                setCategories(categoriesData);
                setGroupedOptions(optionsData);

                if (isEditing && productInfoId) {
                    const productData = await getProductDetail(Number(productInfoId));

                    const optionValueMap = new Map<string, number>();
                    optionsData.forEach(group => {
                        group.optionValues.forEach(val => {
                            optionValueMap.set(`${group.name}:${val.value}`, val.id);
                        });
                    });

                    const mappedVariants = productData.products.map(p => {
                        const ids = p.options.map(opt => {
                            const key = `${opt.groupName}:${opt.value}`;
                            return optionValueMap.get(key);
                        }).filter((id): id is number => id !== undefined);

                        return {
                            productId: p.productId,
                            inventory: p.inventory,
                            optionValueIds: ids,
                            imageUrls: p.imageUrls,
                        };
                    });

                    setFormData({
                        productInfo: {
                            brandId: productData.productInfo.brand.brandId,
                            categoryId: productData.productInfo.category.categoryId,
                            name: productData.productInfo.name,
                            code: productData.productInfo.code,
                            releasePrice: productData.productInfo.releasePrice,
                            releasedDate: new Date(productData.productInfo.releaseDate).toISOString().substring(0, 16),
                        },
                        variants: mappedVariants
                    });
                }
            } catch (err) {
                console.error("Failed to load initial data", err);
                alert("데이터 로딩에 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [isEditing, productInfoId]);

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            productInfo: {
                ...prev.productInfo,
                [name]: (name === 'brandId' || name === 'categoryId' || name === 'releasePrice') && value ? Number(value) : value,
            },
        }));
    };

    const handleVariantChange = (index: number, field: keyof FormVariantData, value: any) => {
        const newVariants = [...formData.variants];
        (newVariants[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { optionValueIds: [], inventory: 0, imageUrls: [''] }],
        }));
    };

    const removeVariant = (index: number) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index),
        }));
    };

    const handleImageUrlChange = (variantIndex: number, imageIndex: number, value: string) => {
        const newVariants = [...formData.variants];
        newVariants[variantIndex].imageUrls[imageIndex] = value;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const addImageUrl = (variantIndex: number) => {
        const newVariants = [...formData.variants];
        newVariants[variantIndex].imageUrls.push('');
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const removeImageUrl = (variantIndex: number, imageIndex: number) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map((variant, vIdx) => vIdx === variantIndex
                ? { ...variant, imageUrls: variant.imageUrls.filter((_, iIdx) => iIdx !== imageIndex) }
                : variant
            ),
        }));
    };

    const toggleOptionValue = (variantIndex: number, selectedOptionValueId: number) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            const currentVariant = { ...newVariants[variantIndex] };
            let updatedOptionValueIds = [...currentVariant.optionValueIds];

            // 1. Find the group of the selected option value
            let selectedOptionGroupId: number | undefined;
            for (const group of groupedOptions) {
                if (group.optionValues.some(ov => ov.id === selectedOptionValueId)) {
                    selectedOptionGroupId = group.id;
                    break;
                }
            }

            if (selectedOptionGroupId === undefined) {
                console.warn(`OptionValueId ${selectedOptionValueId} not found in any group.`);
                return prev; // Should not happen if data is consistent
            }

            // 2. Filter out any existing optionValueIds from the same group
            //    To do this, we need to know the group of each existing optionValueId.
            updatedOptionValueIds = updatedOptionValueIds.filter(existingId => {
                let existingOptionGroupId: number | undefined;
                for (const group of groupedOptions) {
                    if (group.optionValues.some(ov => ov.id === existingId)) {
                        existingOptionGroupId = group.id;
                        break;
                    }
                }
                // Keep only options that are not from the same group as the selected one
                return existingOptionGroupId !== selectedOptionGroupId;
            });

            // 3. Add or remove the selected optionValueId (toggling)
            if (updatedOptionValueIds.includes(selectedOptionValueId)) {
                // If it was already in the filtered list (meaning it was the only one from its group), remove it (unselect)
                updatedOptionValueIds = updatedOptionValueIds.filter(id => id !== selectedOptionValueId);
            } else {
                // Otherwise, add it (select)
                updatedOptionValueIds.push(selectedOptionValueId);
            }

            newVariants[variantIndex] = {
                ...currentVariant,
                optionValueIds: updatedOptionValueIds,
            };

            return { ...prev, variants: newVariants };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.productInfo.brandId || !formData.productInfo.categoryId) {
            alert("브랜드와 카테고리를 선택해주세요.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: ProductCreateRequest | ProductUpdateRequest = {
                ...formData,
                productInfo: {
                    ...formData.productInfo,
                    brandId: Number(formData.productInfo.brandId),
                    categoryId: Number(formData.productInfo.categoryId),
                    releasedDate: new Date(formData.productInfo.releasedDate).toISOString()
                },
                variants: formData.variants,
            };

            if (isEditing && productInfoId) {
                await updateProduct(Number(productInfoId), payload as ProductUpdateRequest);
                alert('상품이 수정되었습니다.');
            } else {
                await createProduct(payload as ProductCreateRequest);
                alert('상품이 등록되었습니다.');
            }
            navigate('/'); // 임시로, 메인 페이지로 이동
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('상품 저장에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin w-10 h-10" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-[100px] pb-24 px-6 font-pretendard">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="text-3xl font-black text-[#333] tracking-tight">{isEditing ? '상품 수정' : '상품 등록'}</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <FormCard title="상품 기본 정보">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                            <FormField label="상품명">
                                <StyledInput name="name" value={formData.productInfo.name} onChange={handleInfoChange} required />
                            </FormField>
                            <FormField label="상품 코드">
                                <StyledInput name="code" value={formData.productInfo.code} onChange={handleInfoChange} required />
                            </FormField>
                            <FormField label="브랜드">
                                <StyledSelect name="brandId" value={formData.productInfo.brandId} onChange={handleInfoChange} required>
                                    <option value="" disabled>브랜드를 선택하세요</option>
                                    {brands.map(b => <option key={b.brandId} value={b.brandId}>{b.name}</option>)}
                                </StyledSelect>
                            </FormField>
                            <FormField label="카테고리">
                                <StyledSelect name="categoryId" value={formData.productInfo.categoryId} onChange={handleInfoChange} required>
                                    <option value="" disabled>카테고리를 선택하세요</option>
                                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                                </StyledSelect>
                            </FormField>
                            <FormField label="발매가">
                                <StyledInput type="number" name="releasePrice" value={formData.productInfo.releasePrice} onChange={handleInfoChange} required />
                            </FormField>
                            <FormField label="발매일">
                                <StyledInput type="datetime-local" name="releasedDate" value={formData.productInfo.releasedDate} onChange={handleInfoChange} required />
                            </FormField>
                        </div>
                    </FormCard>

                    <FormCard title="상품 옵션 (Variants)">
                        <div className="space-y-6">
                            {formData.variants.map((variant, vIdx) => (
                                <div key={vIdx} className="bg-gray-50/70 p-6 rounded-xl border border-gray-200/80 relative">
                                    <h4 className="font-bold text-gray-700 mb-4">옵션 #{vIdx + 1}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                        <FormField label="재고">
                                            <StyledInput type="number" value={variant.inventory} onChange={e => handleVariantChange(vIdx, 'inventory', Number(e.target.value))} />
                                        </FormField>
                                        <FormField label="옵션 선택">
                                            <div className="space-y-4">
                                                {groupedOptions.map((group) => (
                                                    <div key={group.id}>
                                                        <p className="text-xs font-semibold text-gray-600 mb-2">{group.name}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {group.optionValues.map(opt => (
                                                                <button
                                                                    key={opt.id}
                                                                    type="button"
                                                                    onClick={() => toggleOptionValue(vIdx, opt.id)}
                                                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${variant.optionValueIds.includes(opt.id) ? 'bg-accent/10 border-accent text-accent' : 'bg-white border-gray-200 hover:border-gray-400'}`}
                                                                >
                                                                    {opt.value}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </FormField>
                                        <div className="md:col-span-2">
                                            <FormField label="이미지 URL">
                                                <div className="space-y-3">
                                                    {variant.imageUrls.map((url, iIdx) => (
                                                        <div key={iIdx} className="flex items-center gap-2">
                                                            <StyledInput type="url" placeholder="https://example.com/image.jpg" value={url} onChange={e => handleImageUrlChange(vIdx, iIdx, e.target.value)} required />
                                                            <button type="button" onClick={() => removeImageUrl(vIdx, iIdx)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => addImageUrl(vIdx)}
                                                        className="w-full mt-2 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 bg-white border-2 border-dashed border-gray-300 rounded-lg py-3 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                                                    >
                                                        <ImageIcon size={16} /> 이미지 URL 추가
                                                    </button>
                                                </div>
                                            </FormField>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeVariant(vIdx)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addVariant}
                                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-accent bg-accent/5 border-2 border-dashed border-accent/20 rounded-xl py-4 hover:bg-accent/10 transition-colors"
                            >
                                <Plus size={16} /> 새 옵션 추가
                            </button>
                        </div>
                    </FormCard>

                    <div className="flex justify-end pt-4">
                        <div className="w-full md:w-1/4">
                            <PrimaryButton type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin mx-auto"/> : isEditing ? '상품 수정하기' : '상품 등록하기'}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProductManagement;