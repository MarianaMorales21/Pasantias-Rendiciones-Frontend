import { helpHttp, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import { OrganizationsItem } from "../types/organizations";

const api = helpHttp();
const url = `${API_BASE_URL}/organization`;

export const organizationService = {
    getAll: () => api.get(url) as Promise<ApiResponse<OrganizationsItem[]>>,
    getOne: (rif: string) => api.get(`${url}/${rif}`) as Promise<ApiResponse<OrganizationsItem>>,
    create: (data: Partial<OrganizationsItem>) => api.post(url, { body: data }) as Promise<ApiResponse<OrganizationsItem>>,
    update: (rif: string, data: Partial<OrganizationsItem>) => api.put(`${url}/${rif}`, { body: data }) as Promise<ApiResponse<OrganizationsItem>>,
    delete: (rif: string) => api.del(`${url}/${rif}`) as Promise<ApiResponse<{ message: string }>>,
};