import axios from './axios';

export const uploadImage = async (files: File[], category: string): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('images', file);
    });

    const response = await axios.post(`/api/v1/products/images/upload/${category}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    console.log('Image upload response:', response);
    if (response.data && response.data.data && Array.isArray(response.data.data.fileUrl)) { // Check if it's an array, even if empty
        return response.data.data.fileUrl;
    } else {
        throw new Error('Image upload response did not contain a valid file URL array.');
    }
};