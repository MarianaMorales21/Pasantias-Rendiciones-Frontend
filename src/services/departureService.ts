import { helpHttp, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import { departureItem } from "../types/departure";

const api = helpHttp();
const url = `${API_BASE_URL}/departure`;

export const departureService = {
    getAll: () => api.get(url) as Promise<ApiResponse<departureItem[]>>,
    getOne: (cod_par: number) => api.get(`${url}/${cod_par}`) as Promise<ApiResponse<departureItem>>,
    create: (data: Partial<departureItem>) => api.post(url, { body: data }) as Promise<ApiResponse<departureItem>>,
    update: (cod_par: number, data: Partial<departureItem>) => api.put(`${url}/${cod_par}`, { body: data }) as Promise<ApiResponse<departureItem>>,
    delete: (cod_par: number) => api.del(`${url}/${cod_par}`) as Promise<ApiResponse<{ message: string }>>,
};
