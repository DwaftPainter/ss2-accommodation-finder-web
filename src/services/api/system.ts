import apiClient from "../../lib/axios";

export interface HealthResponse {
    status: string;
    timestamp: string;
}

export const systemApi = {
    health: async (): Promise<HealthResponse> => {
        const { data } = await apiClient.get<HealthResponse>("/api/health");
        return data;
    },
};
