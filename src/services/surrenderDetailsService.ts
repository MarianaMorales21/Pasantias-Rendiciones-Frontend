import { helpHttp, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import { SurrenderDetailsItem } from "../types/surrenderDetails"

const api = helpHttp();
const url = `${API_BASE_URL}/rendition-detail`

export const surrenderDetailsService = {
    getAll: () => api.get(url) as Promise<ApiResponse<SurrenderDetailsItem[]>>,
    getOne: (codigo: string) => api.get(`${url}/${codigo}`) as Promise<ApiResponse<SurrenderDetailsItem>>,
    create: (data: Partial<SurrenderDetailsItem>) => api.post(url, { body: data }) as Promise<ApiResponse<SurrenderDetailsItem>>,
    update: (codigo: string, data: Partial<SurrenderDetailsItem>) => api.put(`${url}/${codigo}`, { body: data }) as Promise<ApiResponse<SurrenderDetailsItem>>,
    delete: (codigo: string) => api.del(`${url}/${codigo}`) as Promise<ApiResponse<{message: string}>>,
}