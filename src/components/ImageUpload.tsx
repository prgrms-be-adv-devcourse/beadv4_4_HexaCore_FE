import React, { useRef, useState, useEffect } from 'react';
import { ImageIcon, X } from 'lucide-react';

interface ImageUploadProps {
    value?: string; // This is the URL from S3 or previous state, or a temporary local URL
    onFileSelect: (file: File | null) => void; // New prop to pass selected File object
    onRemove: () => void;
    label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onFileSelect, onRemove }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [localFile, setLocalFile] = useState<File | null>(null); // To hold the selected file locally
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If a new value (URL) is provided, update previewUrl
        if (typeof value === 'string' && value !== previewUrl) {
            setPreviewUrl(value);
            setLocalFile(null); // Clear any locally selected file if an external URL is set
        } else if (!value && !localFile) {
            setPreviewUrl(null); // Clear preview if no value or localFile
        }
    }, [value, localFile, previewUrl]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            setLocalFile(null);
            setPreviewUrl(null);
            onFileSelect(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const file = files[0];
        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 업로드할 수 있습니다.');
            setLocalFile(null);
            setPreviewUrl(null);
            onFileSelect(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setError(null);
        setLocalFile(file);
        setPreviewUrl(URL.createObjectURL(file)); // Create a local preview URL
        onFileSelect(file); // Pass the File object to the parent
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering file input click
        setLocalFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onRemove(); // Notify parent to clear its state
    };

    const displayImageSrc = localFile ? URL.createObjectURL(localFile) : previewUrl;

    return (
        <div className="space-y-2">
            {(displayImageSrc) ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                    <img src={displayImageSrc} alt="Uploaded" className="object-cover w-full h-full" />
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
            {error && !displayImageSrc && (
                <p className="text-red-500 text-xs">{error}</p>
            )}
        </div>
    );
};