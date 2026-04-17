import { helpHttp, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import { AccountantItem } from "../types/accountant";

const api = helpHttp();
const url = `${API_BASE_URL}/accountant`;

export const accountantService = {
    getAll: () => api.get(url) as Promise<ApiResponse<AccountantItem[]>>,
    getOne: (cedula: string) => api.get(`${url}/${cedula}`) as Promise<ApiResponse<AccountantItem>>,
    create: (data: Partial<AccountantItem>) => api.post(url, { body: data }) as Promise<ApiResponse<AccountantItem>>,
    update: (cedula: string, data: Partial<AccountantItem>) => api.put(`${url}/${cedula}`, { body: data }) as Promise<ApiResponse<AccountantItem>>,
    delete: (cedula: string) => api.del(`${url}/${cedula}`) as Promise<ApiResponse<{ message: string }>>,
};
