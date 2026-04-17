import { helpHttp, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import { BeneficiaryItem } from "../types/beneficiary";


const api = helpHttp();
const url = `${API_BASE_URL}/beneficiary`;

export const beneficiaryService = {
    getAll: () => api.get(url) as Promise<ApiResponse<BeneficiaryItem[]>>,
    getOne: (rif: string) => api.get(`${url}/${rif}`) as Promise<ApiResponse<BeneficiaryItem>>,
    create: (data: Partial<BeneficiaryItem>) => api.post(url, {body: data}) as Promise<ApiResponse<BeneficiaryItem>>,
    update: (rif: string, data: Partial<BeneficiaryItem>) => api.put(`${url}/${rif}`, { body: data }) as Promise<ApiResponse<BeneficiaryItem>>,
    delete: (rif: string) => api.del(`${url}/${rif}`) as Promise<ApiResponse<{message: string}>>,
};