import React from 'react';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
    const sizeClasses = {
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-3xl',
        xl: 'text-4xl'
    };

    return (
        <span
            className={`font-[900] tracking-tight bg-gradient-to-r from-[#5c6bc0] to-[#8e24aa] bg-clip-text text-transparent !font-inter ${sizeClasses[size]} ${className}`}
            style={{
                fontFamily: "'Inter', sans-serif",
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}
        >
            Resello
        </span>
    );
};
