import apiClient from "../../lib/axios";
import type {
    LoginPayload,
    RegisterPayload,
    User,
    VerifyEmailPayload,
    VerifyEmailResponse,
    AuthResponse,
    RegisterResponse,
    GoogleLoginPayload
} from "../../types";

export const authApi = {
    /**
     * Get current user info
     */
    getMe: async (): Promise<User> => {
        const { data } = await apiClient.get<User>("/api/users/me");
        return data;
    },

    /**
     * Login with email and password
     */
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        const { data } = await apiClient.post<AuthResponse>("/api/auth/login", payload);
        return data;
    },

    /**
     * Register new account
     */
    register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
        const { data } = await apiClient.post<RegisterResponse>("/api/auth/register", payload);
        return data;
    },

    /**
     * Verify Email by OTP
     */
    verifyOtp: async (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> => {
        const { data } = await apiClient.post<VerifyEmailResponse>("/api/auth/verify-email", payload);
        return data;
    },

    /**
     * Resend OTP to email
     */
    resendOtp: async (email: string): Promise<{ code?: string; message: string }> => {
        const { data } = await apiClient.post<{ code?: string; message: string }>(
            "/api/auth/resend-otp",
            { email }
        );
        return data;
    },

    /**
     * Refresh access token
     */
    refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
        const { data } = await apiClient.post<{ accessToken: string; refreshToken: string }>(
            "/api/auth/refresh",
            { refreshToken }
        );
        return data;
    },

    /**
     * Logout - revoke current session
     */
    logout: async (refreshToken: string): Promise<void> => {
        await apiClient.post("/api/auth/logout", { refreshToken });
    },

    /**
     * Logout from all devices
     */
    logoutAll: async (): Promise<void> => {
        await apiClient.post("/api/auth/logout-all");
    },

    /**
     * Create or load a backend session from the Auth0 Google profile.
     */
    loginWithGoogle: async (payload: GoogleLoginPayload): Promise<AuthResponse> => {
        const { data } = await apiClient.post<AuthResponse>("/api/auth/google", payload);
        return data;
    }
};
