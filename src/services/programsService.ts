import { helpHttp, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import { ProgramsItem } from "../types/programs";

const api = helpHttp();
const url = `${API_BASE_URL}/programs`;

export const programsService = {
    getAll: () => api.get(url) as Promise<ApiResponse<ProgramsItem[]>>,
    getOne: (codigo: number) => api.get(`${url}/${codigo}`) as Promise<ApiResponse<ProgramsItem>>,
    create: (data: Partial<ProgramsItem>) => api.post(url, { body: data }) as Promise<ApiResponse<ProgramsItem>>,
    update: (codigo: number, data: Partial<ProgramsItem>) => api.put(`${url}/${codigo}`, { body: data }) as Promise<ApiResponse<ProgramsItem>>,
    delete: (codigo: number) => api.del(`${url}/${codigo}`) as Promise<ApiResponse<{message: string}>>,
};