import { helpHttp, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import { RankItem } from "../types/ranks";

const api = helpHttp();
const url = `${API_BASE_URL}/ranks`;

export const ranksService = {
    getAll: () => api.get(url) as Promise<ApiResponse<RankItem[]>>,
    getOne: (id: number) => api.get(`${url}/${id}`) as Promise<ApiResponse<RankItem>>,
    create: (data: Partial<RankItem>) => api.post(url, { body: data }) as Promise<ApiResponse<RankItem>>,
    update: (id: number, data: Partial<RankItem>) => api.put(`${url}/${id}`, { body: data }) as Promise<ApiResponse<RankItem>>,
    delete: (id: number) => api.del(`${url}/${id}`) as Promise<ApiResponse<{ message: string }>>,
};
