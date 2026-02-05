import axios from './axios';

export const uploadImage = async (file: File, folder?: string): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    if (folder) {
        formData.append('folder', folder);
    }

    // Assuming the backend endpoint for image upload is /api/v1/images/upload
    const response = await axios.post('/api/v1/images/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.url; // Assuming the backend returns { url: '...' }
};