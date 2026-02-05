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
    ChevronLeft, Plus, Trash2, X, Loader2
} from 'lucide-react';
import { ImageUpload } from '../../components/ImageUpload';
import { uploadImage } from '../../api/upload';

// Form State에 맞는 로컬 타입 정의
interface FormProductInfo {
    brandId: number | '';
    categoryId: number | '';
    name: string;
    code: string;
    releasePrice: number;
    releasedDate: string; // Keep as string for input[type=datetime-local]
}

interface FormVariantData {
    productId?: number;
    optionValueIds: number[];
    inventory: number;
    imageUrls: (File | string | null)[];
}

interface FormState {
    productInfo: FormProductInfo;
    variants: FormVariantData[];
}

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

const StyledSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <div className="relative">
        <select
            {...props}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 font-medium text-[#333] transition appearance-none"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
            <ChevronLeft size={16} className="transform -rotate-90" />
        </div>
    </div>
);

const PrimaryButton: React.FC<{ children: React.ReactNode, onClick?: () => void, type?: 'button'|'submit', disabled?: boolean }> = ({ children, ...props }) => (
    <button
        {...props}
        className="h-14 w-full bg-gray-900 text-white font-bold rounded-xl shadow-md shadow-gray-900/10 transition-all hover:bg-gray-800 active:scale-[0.98] disabled:bg-gray-300 disabled:shadow-none flex items-center justify-center"
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
        variants: [{ optionValueIds: [], inventory: 0, imageUrls: [null] }],
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
                            imageUrls: p.imageUrls.map(url => url || null), // Map empty strings to null
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
                        variants: mappedVariants.length > 0 ? mappedVariants : [{ optionValueIds: [], inventory: 0, imageUrls: [null] }] // New product variant starts with null
                    });
                } else {
                     setFormData({
                        productInfo: { brandId: '', categoryId: '', name: '', code: '', releasePrice: 0, releasedDate: '' },
                        variants: [{ optionValueIds: [], inventory: 0, imageUrls: [null] }], // New product variant starts with null
                    });
                }
            } catch (err) {
                console.error("Failed to load initial data", err);
                alert("데이터 로딩에 실패했습니다.");
                navigate(-1);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [isEditing, productInfoId, navigate]);

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
            variants: [...prev.variants, { optionValueIds: [], inventory: 0, imageUrls: [null] }],
        }));
    };

    const removeVariant = (index: number) => {
        if (formData.variants.length <= 1) {
            alert('최소 하나 이상의 옵션이 필요합니다.');
            return;
        }
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index),
        }));
    };

    const handleImageUrlChange = (variantIndex: number, imageIndex: number, value: File | string | null) => {
        const newVariants = [...formData.variants];
        newVariants[variantIndex].imageUrls[imageIndex] = value;
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const addImageUrl = (variantIndex: number) => {
        const newVariants = [...formData.variants];
        newVariants[variantIndex].imageUrls.push(null);
        setFormData(prev => ({ ...prev, variants: newVariants }));
    };

    const removeImageSlot = (variantIndex: number, imageIndex: number) => {
        if (formData.variants[variantIndex].imageUrls.length <= 1) {
            alert('최소 하나 이상의 이미지가 필요합니다.');
            return;
        }
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

            let selectedOptionGroupId: number | undefined;
            for (const group of groupedOptions) {
                if (group.optionValues.some(ov => ov.id === selectedOptionValueId)) {
                    selectedOptionGroupId = group.id;
                    break;
                }
            }

            if (selectedOptionGroupId === undefined) return prev;

            updatedOptionValueIds = updatedOptionValueIds.filter(existingId => {
                let existingOptionGroupId: number | undefined;
                for (const group of groupedOptions) {
                    if (group.optionValues.some(ov => ov.id === existingId)) {
                        existingOptionGroupId = group.id;
                        break;
                    }
                }
                return existingOptionGroupId !== selectedOptionGroupId;
            });
            
            const isAlreadySelected = currentVariant.optionValueIds.includes(selectedOptionValueId);

            if (!isAlreadySelected) {
                updatedOptionValueIds.push(selectedOptionValueId);
            }

            newVariants[variantIndex] = { ...currentVariant, optionValueIds: updatedOptionValueIds };

            return { ...prev, variants: newVariants };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { brandId, categoryId, name, code, releasePrice, releasedDate } = formData.productInfo;
        if (!brandId || !categoryId || !name || !code || !releasePrice || !releasedDate) {
            alert("상품 기본 정보를 모두 입력해주세요.");
            return;
        }
        
        if (formData.variants.some(v => v.optionValueIds.length !== groupedOptions.length)) {
            alert(`모든 옵션 그룹에 대해 값을 하나씩 선택해주세요. (총 ${groupedOptions.length}개)`);
            return;
        }

        setIsSubmitting(true);
        try {
            const processedVariants = await Promise.all(
                formData.variants.map(async (variant) => {
                    const uploadedImageUrls: string[] = [];
                    for (const urlOrFile of variant.imageUrls) {
                        if (urlOrFile instanceof File) {
                            // Upload new file
                            const imageUrl = await uploadImage(urlOrFile, 'products');
                            uploadedImageUrls.push(imageUrl);
                        } else if (typeof urlOrFile === 'string' && urlOrFile.trim() !== '') {
                            // Keep existing URL
                            uploadedImageUrls.push(urlOrFile);
                        }
                        // Ignore nulls
                    }

                    return {
                        ...variant,
                        imageUrls: uploadedImageUrls,
                    };
                })
            );
            
            // Validate after processing: each variant must have at least one image
            if (processedVariants.some(v => v.imageUrls.length === 0)) {
                alert('각 상품 옵션에는 최소 하나의 이미지가 필요합니다.');
                return;
            }

            const payload: ProductCreateRequest | ProductUpdateRequest = {
                productInfo: {
                    ...formData.productInfo,
                    brandId: Number(formData.productInfo.brandId),
                    categoryId: Number(formData.productInfo.categoryId),
                    releasePrice: Number(formData.productInfo.releasePrice),
                    releasedDate: new Date(formData.productInfo.releasedDate).toISOString()
                },
                variants: processedVariants,
            };

            if (isEditing && productInfoId) {
                await updateProduct(Number(productInfoId), payload as ProductUpdateRequest);
                alert('상품이 수정되었습니다.');
            } else {
                await createProduct(payload as ProductCreateRequest);
                alert('상품이 등록되었습니다.');
            }
            navigate('/admin/products');
        } catch (error: any) {
            console.error('Failed to save product:', error);
            alert(`상품 저장에 실패했습니다: ${error.message || '알 수 없는 오류'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-50"><Loader2 className="animate-spin w-10 h-10 text-gray-400" /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-[100px] pb-24 px-6 font-pretendard">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="text-3xl font-black text-[#333] tracking-tight">{isEditing ? '상품 수정' : '새 상품 등록'}</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <FormCard title="상품 기본 정보">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <FormField label="상품명">
                                <StyledInput name="name" value={formData.productInfo.name} onChange={handleInfoChange} required placeholder="예: 조던 1 레트로 하이 OG" />
                            </FormField>
                            <FormField label="상품 코드 (모델 번호)">
                                <StyledInput name="code" value={formData.productInfo.code} onChange={handleInfoChange} required placeholder="예: 555088-101" />
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
                                <StyledInput type="number" name="releasePrice" value={formData.productInfo.releasePrice} onChange={handleInfoChange} required min="0" />
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
                                    <h4 className="font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">옵션 #{vIdx + 1}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">

                                        {/* 재고 */}
                                        <FormField label="재고">
                                            <StyledInput type="number" value={variant.inventory} onChange={e => handleVariantChange(vIdx, 'inventory', Number(e.target.value))} min="0" />
                                        </FormField>

                                        {/* 옵션 선택 */}
                                        <FormField label="옵션 선택">
                                            <div className="space-y-4">
                                                {groupedOptions.map((group) => (
                                                    <div key={group.id}>
                                                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">{group.name}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {group.optionValues.map(opt => (
                                                                <button
                                                                    key={opt.id}
                                                                    type="button"
                                                                    onClick={() => toggleOptionValue(vIdx, opt.id)}
                                                                    className={`px-3 py-1.5 text-sm font-medium rounded-full border-2 transition-all ${variant.optionValueIds.includes(opt.id) ? 'bg-accent border-accent text-white shadow-sm' : 'bg-white border-gray-200 hover:border-gray-400'}`}
                                                                >
                                                                    {opt.value}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </FormField>

                                        {/* 이미지 */}
                                        <div className="md:col-span-2">
                                            <FormField label="이미지">
                                                <div className="flex flex-wrap gap-4">
                                                    {variant.imageUrls.map((url, iIdx) => (
                                                        <div key={iIdx} className="relative">
                                                            <ImageUpload
                                                                value={(typeof url === 'string' ? url : (url ? URL.createObjectURL(url) : undefined))}
                                                                onFileSelect={(file) => handleImageUrlChange(vIdx, iIdx, file)}
                                                                onRemove={() => handleImageUrlChange(vIdx, iIdx, null)}
                                                            />
                                                            {variant.imageUrls.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeImageSlot(vIdx, iIdx)}
                                                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors z-10"
                                                                    aria-label="이미지 슬롯 삭제"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => addImageUrl(vIdx)}
                                                        className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-accent hover:text-accent transition-colors"
                                                    >
                                                        <Plus size={24} />
                                                        <span className="text-xs mt-1">이미지 추가</span>
                                                    </button>
                                                </div>
                                            </FormField>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeVariant(vIdx)} className="absolute top-5 right-5 p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addVariant}
                                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-accent bg-white border-2 border-dashed border-gray-300 rounded-xl py-4 hover:bg-gray-50 transition-colors"
                            >
                                <Plus size={16} /> 새 옵션 추가
                            </button>
                        </div>
                    </FormCard>

                    <div className="flex justify-end pt-4">
                        <div className="w-full md:w-1/3">
                            <PrimaryButton type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin"/> : isEditing ? '상품 수정하기' : '상품 등록하기'}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
