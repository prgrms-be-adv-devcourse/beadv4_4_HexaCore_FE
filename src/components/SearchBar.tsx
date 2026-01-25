import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    placeholder?: string;
    className?: string;
    maxWidth?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = "브랜드, 상품명으로 검색",
    className = "",
    maxWidth = "800px",
    value,
    onChange
}) => {
    return (
        <div className={`relative flex items-center w-full mx-auto px-5 ${className}`} style={{ maxWidth }}>
            <input
                type="text"
                className="w-full py-4 pr-[60px] pl-7 text-base border-2 border-[#f0f0f0] rounded-[50px] bg-[#f9f9f9] outline-none transition-all duration-300 focus:border-accent/40 focus:bg-white focus:shadow-[0_0_0_4px_rgba(92,107,192,0.1)] font-pretendard placeholder:text-gray-400"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            <button type="submit" className="absolute right-7 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white border-none cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 shadow-md">
                <Search size={20} />
            </button>
        </div>
    );
};
