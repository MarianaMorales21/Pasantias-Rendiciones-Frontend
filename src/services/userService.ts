import { helpHttp, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import { UserItem } from "../types/user";

const api = helpHttp();
const url = `${API_BASE_URL}/users`;

export const userService = {
  getAll: () => api.get(url) as Promise<ApiResponse<UserItem[]>>,
  getOne: (cedula: string) => api.get(`${url}/${cedula}`) as Promise<ApiResponse<UserItem>>,
  create: (data: Partial<UserItem>) => api.post(url, { body: data }) as Promise<ApiResponse<UserItem>>,
  update: (cedula: string, data: Partial<UserItem>) => api.put(`${url}/${cedula}`, { body: data }) as Promise<ApiResponse<UserItem>>,
  delete: (cedula: string) => api.del(`${url}/${cedula}`) as Promise<ApiResponse<{ message: string }>>,
};
