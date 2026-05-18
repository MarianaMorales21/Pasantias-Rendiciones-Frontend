import { helpHttp, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import { AuthorityItem } from "../types/authorities";

const api = helpHttp();
const url = `${API_BASE_URL}/authorities`;

export const authoritiesService = {
    getAll: () => api.get(url) as Promise<ApiResponse<AuthorityItem[]>>,
    getOne: (id: number) => api.get(`${url}/${id}`) as Promise<ApiResponse<AuthorityItem>>,
    create: (data: Partial<AuthorityItem>) => api.post(url, { body: data }) as Promise<ApiResponse<AuthorityItem>>,
    update: (id: number, data: Partial<AuthorityItem>) => api.put(`${url}/${id}`, { body: data }) as Promise<ApiResponse<AuthorityItem>>,
    delete: (id: number) => api.del(`${url}/${id}`) as Promise<ApiResponse<{ message: string }>>,
};
