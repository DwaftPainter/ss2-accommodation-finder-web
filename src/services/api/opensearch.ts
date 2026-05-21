import apiClient from "../../lib/axios";

export interface OpensearchHealthResponse {
    status: "healthy" | "unavailable" | string;
    available: boolean;
}

export const opensearchApi = {
    health: async (): Promise<OpensearchHealthResponse> => {
        const { data } = await apiClient.get<OpensearchHealthResponse>("/api/opensearch/health");
        return data;
    },
};
