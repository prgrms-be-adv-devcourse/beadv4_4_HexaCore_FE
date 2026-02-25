import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/product';
import type { CategoryResponse } from '../../types/product';
import { ChevronLeft, Trash2, Edit, Loader2, Image as ImageIcon } from 'lucide-react';
import { ImageUpload } from '../../components/ImageUpload';
import { uploadImage } from '../../api/upload';

// Reusable Components (from brand management)
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

interface CategoryFormData {
    name: string;
    imageUrl: File | string | null;
}

export const AdminCategoryManagement = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>({ name: '', imageUrl: null });

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const categoriesData = await getCategories();
            setCategories(categoriesData);
        } catch (err) {
            setError('카테고리 목록을 불러오는 데 실패했습니다.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        if (selectedCategory) {
            setFormData({
                name: selectedCategory.name,
                imageUrl: selectedCategory.imageUrl || null // Can be null now
            });
        } else {
            setFormData({ name: '', imageUrl: null }); // Can be null now
        }
    }, [selectedCategory]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            alert('카테고리 이름을 입력해주세요.');
            return;
        }
        setIsSubmitting(true);
        try {
            let finalImageUrl: string | null = null;
            if (formData.imageUrl instanceof File) {
                const uploadedUrls = await uploadImage([formData.imageUrl], 'CATEGORY');
                if (uploadedUrls.length > 0) {
                    finalImageUrl = uploadedUrls[0];
                }
            } else if (typeof formData.imageUrl === 'string') {
                finalImageUrl = formData.imageUrl;
            }

            if (!finalImageUrl) {
                alert('카테고리 이미지를 업로드하거나 선택해주세요.');
                setIsSubmitting(false);
                return;
            }

            if (selectedCategory) {
                // Update
                await updateCategory(selectedCategory.categoryId, { name: formData.name, imageUrl: finalImageUrl });
                alert('카테고리가 수정되었습니다.');
            } else {
                // Create
                await createCategory({ name: formData.name, imageUrl: finalImageUrl });
                alert('카테고리가 생성되었습니다.');
            }
            setSelectedCategory(null);
            setFormData({ name: '', imageUrl: null }); // Reset form
            await fetchCategories(); // Refresh list
        } catch (err) {
            alert(`오류가 발생했습니다: ${err instanceof Error ? err.message : 'Unknown error'}`);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (categoryId: number) => {
        if (window.confirm('정말로 이 카테고리를 삭제하시겠습니까?')) {
            try {
                await deleteCategory(categoryId);
                alert('카테고리가 삭제되었습니다.');
                await fetchCategories();
            } catch (err) {
                alert('카테고리 삭제에 실패했습니다.');
            }
        }
    };

    const handleSelectCategory = (category: CategoryResponse) => {
        setSelectedCategory(category);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const clearSelection = () => {
        setSelectedCategory(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-[100px] pb-24 px-6 font-pretendard">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="text-3xl font-black text-[#333] tracking-tight">카테고리 관리</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Left: Form */}
                    <div className="md:col-span-1 md:sticky md:top-28">
                         <form onSubmit={handleFormSubmit}>
                            <FormCard title={selectedCategory ? '카테고리 수정' : '새 카테고리 추가'}>
                                <div className="space-y-6">
                                    <FormField label="카테고리 이름">
                                        <StyledInput name="name" value={formData.name} onChange={handleInputChange} required />
                                    </FormField>
                                    <FormField label="카테고리 이미지">
                                        <ImageUpload
                                            value={formData.imageUrl}
                                            onFileSelect={(file) => setFormData(prev => ({ ...prev, imageUrl: file }))}
                                            onRemove={() => setFormData(prev => ({ ...prev, imageUrl: null }))}
                                            label="카테고리 이미지"
                                        />
                                    </FormField>
                                    <div className="flex flex-col gap-3 pt-4">
                                       <PrimaryButton type="submit" disabled={isSubmitting}>
                                            {isSubmitting 
                                                ? <Loader2 className="animate-spin mx-auto" />
                                                : selectedCategory ? '수정하기' : '추가하기'
                                            }
                                        </PrimaryButton>
                                        {selectedCategory && (
                                            <button type="button" onClick={clearSelection} className="text-sm text-gray-500 hover:text-black">
                                                + 새 카테고리 추가
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </FormCard>
                        </form>
                    </div>

                    {/* Right: List */}
                    <div className="md:col-span-2">
                        <FormCard title="카테고리 목록">
                            {isLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                            ) : error ? (
                                <div className="text-center text-red-500 p-8">{error}</div>
                            ) : (
                                <div className="space-y-3">
                                    {categories.map(category => (
                                        <div key={category.categoryId} className="flex items-center justify-between bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
                                            <div className="flex items-center gap-4">
                                                {category.imageUrl ? (
                                                    <img src={category.imageUrl} alt={category.name} className="w-10 h-10 object-contain rounded-md" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                                        <ImageIcon size={20} className="text-gray-400"/>
                                                    </div>
                                                )}
                                                <span className="font-bold text-gray-800">{category.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleSelectCategory(category)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(category.categoryId)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {categories.length === 0 && (
                                        <p className="text-center text-gray-500 py-8">등록된 카테고리가 없습니다.</p>
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
