import { helpHttp, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import { OrderItem } from "../types/orders";

const api = helpHttp();
const url = `${API_BASE_URL}/order`;

export const orderService = {
    getAll: () => api.get(url) as Promise<ApiResponse<OrderItem[]>>,
    getOne: (id: number | string) => api.get(`${url}/${id}`) as Promise<ApiResponse<OrderItem>>,
    create: (data: Partial<OrderItem>) => api.post(url, { body: data }) as Promise<ApiResponse<OrderItem>>,
    update: (id: number | string, data: Partial<OrderItem>) => api.put(`${url}/${id}`, { body: data }) as Promise<ApiResponse<OrderItem>>,
    delete: (id: number | string) => api.del(`${url}/${id}`) as Promise<ApiResponse<{ message: string }>>,
}