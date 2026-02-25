import React, { useRef, useState, useEffect } from 'react';
import { ImageIcon, X } from 'lucide-react';

interface ImageUploadProps {
    value?: string | File | null; // Changed to accept File or string or null
    onFileSelect: (file: File | null) => void;
    onRemove: () => void;
    label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onFileSelect, onRemove }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let objectUrl: string | null = null;

        if (typeof value === 'string') {
            setPreviewUrl(value);
        } else if (value instanceof File) {
            objectUrl = URL.createObjectURL(value);
            setPreviewUrl(objectUrl);
        } else {
            setPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [value]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            onFileSelect(null);
            return;
        }

        const file = files[0];
        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 업로드할 수 있습니다.');
            onFileSelect(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setError(null);
        onFileSelect(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering file input click
        onRemove(); // Notify parent to clear its state
    };

    return (
        <div className="space-y-2">
            {previewUrl ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                    <img src={previewUrl} alt="Uploaded" className="object-cover w-full h-full" />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-opacity"
                        aria-label="Remove image"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-accent hover:text-accent transition-colors relative"
                    onClick={handleClick}
                >
                    <ImageIcon size={24} />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    {error && (
                        <p className="absolute -bottom-6 text-red-500 text-xs text-center w-full">{error}</p>
                    )}
                </div>
            )}
            {error && !previewUrl && (
                <p className="text-red-500 text-xs">{error}</p>
            )}
        </div>
    );
};