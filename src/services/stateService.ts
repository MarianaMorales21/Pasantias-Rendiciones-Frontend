import { helpHttp, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import { StateItem } from "../types/state";

const api = helpHttp();
const url = `${API_BASE_URL}/state`;

export const stateService = {
    getAll: () => api.get(url) as Promise<ApiResponse<StateItem[]>>,
    getOne: (codigo: string) => api.get(`${url}/${codigo}`) as Promise<ApiResponse<StateItem>>,
}
