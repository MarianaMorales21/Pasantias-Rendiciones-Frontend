import { helpHttp, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import {
  FullDetailedReport,
  FullActaReport,
  RenditionListItem,
  FullOPGReport,
  DashboardStatsResponse,
  DepartureStatItem
} from "../types/reports";

const api = helpHttp();
const url = `${API_BASE_URL}/reports`;


export const reportService = {
  // Lista de rendiciones activas para el selector
  getRenditionList: (): Promise<ApiResponse<{ ok: boolean; data: RenditionListItem[] }>> => {
    return api.get(`${url}/renditions`) as Promise<ApiResponse<{ ok: boolean; data: RenditionListItem[] }>>;
  },

  // Reporte detallado (tabla de gastos agrupada por programa)
  getDetailedReport: (cod_rnd: number | string): Promise<ApiResponse<FullDetailedReport>> => {
    return api.get(`${url}/detailed/${cod_rnd}`) as Promise<ApiResponse<FullDetailedReport>>;
  },

  // Acta de entrega (carta formal)
  getActaReport: (cod_rnd: number | string): Promise<ApiResponse<FullActaReport>> => {
    return api.get(`${url}/acta/${cod_rnd}`) as Promise<ApiResponse<FullActaReport>>;
  },

  // Reporte Historial completo de la OPG
  getFullOPGReport: (cod_opg: number | string): Promise<ApiResponse<FullOPGReport>> => {
    return api.get(`${url}/opg/${cod_opg}`) as Promise<ApiResponse<FullOPGReport>>;
  },

  // Estadísticas globales para el dashboard
  getDashboardStats: (): Promise<ApiResponse<DashboardStatsResponse>> => {
    return api.get(`${url}/dashboard-stats`) as Promise<ApiResponse<DashboardStatsResponse>>;
  },

  // Estadísticas por partida presupuestaria
  getDepartureStats: (codOpg?: number): Promise<ApiResponse<{ ok: boolean; data: DepartureStatItem[] }>> => {
    const query = codOpg ? `?cod_opg=${codOpg}` : "";
    return api.get(`${url}/dashboard/departure-stats${query}`) as Promise<ApiResponse<{ ok: boolean; data: DepartureStatItem[] }>>;
  },
};