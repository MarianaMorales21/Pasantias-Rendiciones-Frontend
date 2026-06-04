import { helpHttp, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import { BeneficiaryItem } from "../types/beneficiary";


const api = helpHttp();
const url = `${API_BASE_URL}/beneficiary`;

export const beneficiaryService = {
    getAll: () => api.get(url) as Promise<ApiResponse<BeneficiaryItem[]>>,
    getOne: (cod_ben: number) => api.get(`${url}/${cod_ben}`) as Promise<ApiResponse<BeneficiaryItem>>,
    create: (data: Partial<BeneficiaryItem>) => api.post(url, {body: data}) as Promise<ApiResponse<BeneficiaryItem>>,
    update: (cod_ben: number, data: Partial<BeneficiaryItem>) => api.put(`${url}/${cod_ben}`, { body: data }) as Promise<ApiResponse<BeneficiaryItem>>,
    delete: (cod_ben: number) => api.del(`${url}/${cod_ben}`) as Promise<ApiResponse<{message: string}>>,
};
