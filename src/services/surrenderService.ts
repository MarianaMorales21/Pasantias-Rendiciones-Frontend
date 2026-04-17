import { helpHttp, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import { SurrenderItem } from "../types/surrender";

const api = helpHttp();
const url = `${API_BASE_URL}/rendition`;

export const asurrenderService = {
    getAll: () => api.get(url) as Promise<ApiResponse<SurrenderItem[]>>,
    getOne: (codigo: string) => api.get(`${url}/${codigo}`) as Promise<ApiResponse<SurrenderItem>>,
    create: (data: Partial<SurrenderItem>) => api.post(url, {body: data}) as Promise<ApiResponse<SurrenderItem>>,
    update: (codigo: string, data: Partial<SurrenderItem>) => api.put(`${url}/${codigo}`, { body: data }) as Promise<ApiResponse<SurrenderItem>>,
    delete: (codigo: string) => api.del(`${url}/${codigo}`) as Promise<ApiResponse<{message: string}>>,
}
