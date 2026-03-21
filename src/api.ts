import type {
    ListingSummary,
    ListingDetail,
    ReviewsResponse,
    Review,
    SavedListing,
    User,
    ListingFormData,
} from './types';

const API_BASE = '';

function getToken(): string | null {
    return localStorage.getItem('token');
}

function authHeaders(): Record<string, string> {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
            ...(options.headers as Record<string, string>),
        },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${res.status}`);
    }

    return res.json();
}

export const authApi = {
    getMe: () => apiFetch<User>('/auth/me'),
    loginUrl: () => `${API_BASE}/auth/google`,
};

export const listingsApi = {
    getAll: (params: Record<string, string | number | undefined> = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '') {
                query.set(key, String(val));
            }
        });
        const qs = query.toString();
        return apiFetch<ListingSummary[]>(`/api/listings${qs ? `?${qs}` : ''}`);
    },
    getById: (id: string) => apiFetch<ListingDetail>(`/api/listings/${id}`),
    create: (data: ListingFormData) =>
        apiFetch<ListingDetail>('/api/listings', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<ListingFormData>) =>
        apiFetch<ListingDetail>(`/api/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch<{ message: string }>(`/api/listings/${id}`, { method: 'DELETE' }),
};

export const reviewsApi = {
    getByListing: (listingId: string) =>
        apiFetch<ReviewsResponse>(`/api/listings/${listingId}/reviews`),
    create: (listingId: string, data: { rating: number; comment: string }) =>
        apiFetch<Review>(`/api/listings/${listingId}/reviews`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

export const savedApi = {
    getAll: () => apiFetch<SavedListing[]>('/api/saved'),
    toggle: (listingId: string) =>
        apiFetch<{ saved: boolean; message: string }>(`/api/saved/${listingId}`, { method: 'POST' }),
};
