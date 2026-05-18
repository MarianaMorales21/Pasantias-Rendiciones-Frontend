import { helpHttp, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import { DebitNoteItem } from "../types/debitNote";

const api = helpHttp();
const url = `${API_BASE_URL}/debit-note`;

export const debitNoteService = {
    getAll: () => api.get(url) as Promise<ApiResponse<DebitNoteItem[]>>,
    getOne: (id: number | string) => api.get(`${url}/${id}`) as Promise<ApiResponse<DebitNoteItem>>,
    getByRendition: (cod_rnd: number | string) => api.get(`${url}/rendition/${cod_rnd}`) as Promise<ApiResponse<DebitNoteItem[]>>,
    create: (data: Partial<DebitNoteItem>) => api.post(url, { body: data }) as Promise<ApiResponse<DebitNoteItem>>,
    update: (id: number | string, data: Partial<DebitNoteItem>) => api.put(`${url}/${id}`, { body: data }) as Promise<ApiResponse<DebitNoteItem>>,
    delete: (id: number | string) => api.del(`${url}/${id}`) as Promise<ApiResponse<{ message: string }>>,
};
