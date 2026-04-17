import axios, {
    type AxiosInstance,
    type AxiosError,
    type AxiosRequestConfig,
} from "axios";
import { STORAGE_KEYS, API_BASE_URL } from "./constants";

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
            // Extract error message from response if available
            const errorMessage = (error.response.data as { message?: string })?.message
                || error.message
                || "An error occurred";

            // Enhance error with response message
            error.message = errorMessage;

            // Handle specific status codes
            switch (error.response.status) {
                case 401:
                    // Clear tokens on unauthorized but don't redirect here
                    // Let the auth store handle the redirect after setting error
                    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                    break;
                case 403:
                    console.error("Access forbidden");
                    break;
                case 404:
                    console.error("Resource not found");
                    break;
                case 500:
                    console.error("Server error");
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
