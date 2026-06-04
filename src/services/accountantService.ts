import { helpHttp, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import { AccountantItem } from "../types/accountant";

const api = helpHttp();
const url = `${API_BASE_URL}/accountant`;

export const accountantService = {
    getAll: () => api.get(url) as Promise<ApiResponse<AccountantItem[]>>,
    getOne: (cod_ctd: number) => api.get(`${url}/${cod_ctd}`) as Promise<ApiResponse<AccountantItem>>,
    create: (data: Partial<AccountantItem>) => api.post(url, { body: data }) as Promise<ApiResponse<AccountantItem>>,
    update: (cod_ctd: number, data: Partial<AccountantItem>) => api.put(`${url}/${cod_ctd}`, { body: data }) as Promise<ApiResponse<AccountantItem>>,
    delete: (cod_ctd: number) => api.del(`${url}/${cod_ctd}`) as Promise<ApiResponse<{ message: string }>>,
};
