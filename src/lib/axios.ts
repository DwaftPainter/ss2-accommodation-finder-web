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
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
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
            // Handle specific status codes
            switch (error.response.status) {
                case 401:
                    // Clear token on unauthorized
                    localStorage.removeItem(STORAGE_KEYS.TOKEN);
                    window.location.href = "/?error=session_expired";
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
