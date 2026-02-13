import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getOptions, 
    createOptionGroup, 
    deleteOptionGroup,
    updateOptionGroupName,
    appendOptionValues,
    updateOptionValue,
    deleteOptionValue,
} from '../../api/product';
import type { OptionGroupResponse, ValueDto, GroupDto } from '../../types/product';
import { ChevronLeft, Trash2, Edit, Loader2, Image as ImageIcon, Plus, X, Tag } from 'lucide-react';

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

interface OptionValueEdit {
    id?: number;
    name: string;
    isNew?: boolean;
}

interface OptionGroupFormData {
    name: string;
    optionValues: Partial<OptionValueEdit>[];
}

export const AdminOptionManagement = () => {
    const navigate = useNavigate();

    const [optionGroups, setOptionGroups] = useState<OptionGroupResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedGroup, setSelectedGroup] = useState<OptionGroupResponse | null>(null);
    const [formData, setFormData] = useState<OptionGroupFormData>({ name: '', optionValues: [{ name: '' }] });

    const fetchOptions = useCallback(async () => {
        setIsLoading(true);
        try {
            const optionsData = await getOptions();
            setOptionGroups(optionsData);
        } catch (err) {
            setError('옵션 목록을 불러오는 데 실패했습니다.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    useEffect(() => {
        if (selectedGroup) {
            setFormData({
                name: selectedGroup.group.name,
                optionValues: selectedGroup.values.map(v => ({ name: v.name }))
            });
        } else {
            setFormData({ name: '', optionValues: [{ name: '' }] });
        }
    }, [selectedGroup]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, name: e.target.value }));
    };

    const handleValueChange = (index: number, value: string) => {
        const newValues = [...formData.optionValues];
        newValues[index].name = value;
        setFormData(prev => ({ ...prev, optionValues: newValues }));
    };

    const addValueField = () => {
        setFormData(prev => ({
            ...prev,
            optionValues: [...prev.optionValues, { name: '', isNew: true }]
        }));
    };

    const removeValueField = (index: number) => {
        setFormData(prev => ({
            ...prev,
            optionValues: prev.optionValues.filter((_, i) => i !== index)
        }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('옵션 그룹 이름을 입력해주세요.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            if (selectedGroup) {
                // --- UPDATE LOGIC ---
                const promises: Promise<any>[] = [];
                const originalValues = selectedGroup.values;
                const currentValues = formData.optionValues.filter(v => v.name && v.name.trim() !== '');

                // 1. Group name change
                if (selectedGroup.group.name !== formData.name) {
                    promises.push(updateOptionGroupName(selectedGroup.group.id, { name: formData.name }));
                }

                // 2. Values to delete
                const currentValueIds = new Set(currentValues.map(v => v.id).filter(Boolean));
                const valuesToDelete = originalValues.filter(v => !currentValueIds.has(v.id));
                valuesToDelete.forEach(v => promises.push(deleteOptionValue(v.id)));

                // 3. Values to update
                const valuesToUpdate = currentValues.filter(v => {
                    if (!v.id) return false; // Not an existing value
                    const originalValue = originalValues.find(ov => ov.id === v.id);
                    return originalValue && originalValue.name !== v.name;
                });
                valuesToUpdate.forEach(v => {
                    if (v.id && v.name) {
                        promises.push(updateOptionValue(v.id, { optionGroupId: selectedGroup.group.id, name: v.name }));
                    }
                });

                // 4. Values to add
                const valuesToAdd = currentValues.filter(v => !v.id && v.name).map(v => v.name!);
                if (valuesToAdd.length > 0) {
                    promises.push(appendOptionValues(selectedGroup.group.id, { optionValues: valuesToAdd }));
                }

                await Promise.all(promises);
                alert('옵션 그룹이 수정되었습니다.');

            } else {
                // --- CREATE LOGIC ---
                const validValues = formData.optionValues.map(v => v.name!).filter(v => v && v.trim() !== '');
                if (validValues.length === 0) {
                    alert('옵션 값을 하나 이상 입력해주세요.');
                    setIsSubmitting(false);
                    return;
                }
                const createData = { name: formData.name, optionValues: validValues };
                await createOptionGroup(createData);
                alert('옵션 그룹이 생성되었습니다.');
            }
            clearSelection();
            await fetchOptions();
        } catch (err) {
            alert(`오류가 발생했습니다: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (groupId: number) => {
        if (window.confirm('정말로 이 옵션 그룹을 삭제하시겠습니까? 관련된 모든 상품의 옵션이 영향을 받을 수 있습니다.')) {
            try {
                await deleteOptionGroup(groupId);
                alert('옵션 그룹이 삭제되었습니다.');
                await fetchOptions();
            } catch (err) {
                alert('옵션 그룹 삭제에 실패했습니다.');
            }
        }
    };

    const handleSelectGroup = (group: OptionGroupResponse) => {
        setSelectedGroup(group);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const clearSelection = () => {
        setSelectedGroup(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-[100px] pb-24 px-6 font-pretendard">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <h2 className="text-3xl font-black text-[#333] tracking-tight">상품 옵션 관리</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Left: Form */}
                    <div className="md:col-span-1 md:sticky md:top-28">
                         <form onSubmit={handleFormSubmit}>
                            <FormCard title={selectedGroup ? '옵션 그룹 수정' : '새 옵션 그룹 추가'}>
                                <div className="space-y-6">
                                    <FormField label="옵션 그룹 이름">
                                        <StyledInput name="name" value={formData.name} onChange={handleInputChange} required placeholder="예: 사이즈, 색상" />
                                    </FormField>
                                    
                                    <FormField label="옵션 값">
                                        <div className="space-y-3">
                                            {formData.optionValues.map((val, index) => (
                                                <div key={val.id || `new-${index}`} className="flex items-center gap-2">
                                                    <StyledInput 
                                                        value={val.name} 
                                                        onChange={(e) => handleValueChange(index, e.target.value)} 
                                                        placeholder={`값 #${index + 1}`}
                                                    />
                                                    <button type="button" onClick={() => removeValueField(index)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors flex-shrink-0">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={addValueField} className="w-full mt-2 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 bg-white border-2 border-dashed border-gray-300 rounded-lg py-3 hover:bg-gray-50 hover:border-gray-400 transition-colors">
                                                <Plus size={16} /> 옵션 값 추가
                                            </button>
                                        </div>
                                    </FormField>

                                    <div className="flex flex-col gap-3 pt-4">
                                       <PrimaryButton type="submit" disabled={isSubmitting}>
                                            {isSubmitting 
                                                ? <Loader2 className="animate-spin mx-auto" />
                                                : selectedGroup ? '수정하기' : '추가하기'
                                            }
                                        </PrimaryButton>
                                        {selectedGroup && (
                                            <button type="button" onClick={clearSelection} className="text-sm text-gray-500 hover:text-black">
                                                + 새 그룹 추가
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </FormCard>
                        </form>
                    </div>

                    {/* Right: List */}
                    <div className="md:col-span-2">
                        <FormCard title="옵션 그룹 목록">
                            {isLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                            ) : error ? (
                                <div className="text-center text-red-500 p-8">{error}</div>
                            ) : (
                                <div className="space-y-4">
                                    {optionGroups.map(group => (
                                        <div key={group.group.id} className="bg-gray-50/70 p-5 rounded-xl border border-gray-200/80">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                     <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center">
                                                        <Tag size={16} className="text-gray-500"/>
                                                    </div>
                                                    <span className="font-bold text-gray-800 text-lg">{group.group.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleSelectGroup(group)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(group.group.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 pl-11">
                                                {group.values.map(val => (
                                                    <span key={val.id} className="px-3 py-1 text-sm font-medium bg-white border border-gray-200 rounded-full text-gray-600">
                                                        {val.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {optionGroups.length === 0 && (
                                        <p className="text-center text-gray-500 py-8">등록된 옵션 그룹이 없습니다.</p>
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
