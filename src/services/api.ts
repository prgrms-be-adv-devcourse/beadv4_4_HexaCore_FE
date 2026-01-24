// API 기본 설정

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    let url = `${API_BASE_URL}${endpoint}`;

    if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, {
        ...fetchOptions,
        headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

export const api = {
    get: <T>(endpoint: string, params?: Record<string, string>) =>
        request<T>(endpoint, { method: 'GET', params }),

    post: <T>(endpoint: string, data?: unknown) =>
        request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined
        }),

    put: <T>(endpoint: string, data?: unknown) =>
        request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined
        }),

    patch: <T>(endpoint: string, data?: unknown) =>
        request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined
        }),

    delete: <T>(endpoint: string) =>
        request<T>(endpoint, { method: 'DELETE' }),
};
