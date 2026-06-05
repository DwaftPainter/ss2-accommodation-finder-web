import axios, {
    type AxiosInstance,
    type AxiosError,
    type AxiosRequestConfig,
} from "axios";
import { STORAGE_KEYS, API_BASE_URL } from "./constants";

type ApiErrorData = {
    code?: string;
    message?: string | string[];
    error?: string;
};

export type ApiError = AxiosError & {
    apiCode?: string;
    statusCode?: number;
};

function normalizeErrorMessage(data: unknown, fallback: string): string {
    if (typeof data === "string") {
        const normalized = data.toLowerCase();
        if (
            normalized.includes("<html") ||
            normalized.includes("bad gateway") ||
            normalized.includes("nginx")
        ) {
            return "Máy chủ đang bảo trì. Vui lòng thử lại sau.";
        }
        return data.trim() || fallback;
    }

    if (!data || typeof data !== "object") return fallback;

    const { message, error } = data as ApiErrorData;
    if (Array.isArray(message)) return message.filter(Boolean).join(" ");
    if (typeof message === "string" && message.trim()) return message;
    if (typeof error === "string" && error.trim()) return error;

    return fallback;
}

/**
 * Axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

/**
 * Request interceptor - add auth token
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (
            typeof FormData !== "undefined" &&
            config.data instanceof FormData &&
            config.headers
        ) {
            config.headers.delete("Content-Type");
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor - handle errors
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            const data = error.response.data as ApiErrorData | undefined;
            const errorMessage = normalizeErrorMessage(
                data,
                "Đã xảy ra lỗi. Vui lòng thử lại."
            );

            const enhancedError = error as ApiError;
            error.message = errorMessage;
            enhancedError.apiCode = data?.code;
            enhancedError.statusCode = error.response.status;

            // Handle specific status codes
            switch (error.response.status) {
                case 401:
                    // Clear tokens on unauthorized but don't redirect here
                    // Let the auth store handle the redirect after setting error
                    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                    break;
            }
        }
        return Promise.reject(error);
    }
);

/**
 * Generic API request wrapper
 */
export async function apiRequest<T>(
    config: AxiosRequestConfig
): Promise<T> {
    const response = await apiClient(config);
    return response.data;
}

export default apiClient;
