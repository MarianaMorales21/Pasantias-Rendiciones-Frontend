import { useState, useEffect } from "react";
import { orderService } from "../services/orderService";
import { reportService } from "../services/reportsService";
import { OrderItem } from "../types/orders";
import { isApiError } from "../helpers/helpHttp";
import { DepartureStatItem } from "../types/reports";

export function useDashboard() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashboardStats, setDashboardStats] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [opgReport, setOpgReport] = useState<any>(null);
  const [departureStats, setDepartureStats] = useState<DepartureStatItem[]>([]);
  const [departureStatsMode, setDepartureStatsMode] = useState<"opg" | "annual">("opg");
  const [departureStatsLoading, setDepartureStatsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [ordersRes, statsRes] = await Promise.all([
          orderService.getAll(),
          reportService.getDashboardStats(),
        ]);

        if (!isApiError(ordersRes) && Array.isArray(ordersRes)) {
          // Filtrar órdenes activas, o al menos ordenarlas
          const sorted = [...ordersRes].sort((a, b) => b.cod_opg - a.cod_opg);
          setOrders(sorted);
          if (sorted.length > 0) {
            setSelectedOrder(sorted[0]);
          }
        }

        if (!isApiError(statsRes) && statsRes.ok) {
          setDashboardStats(statsRes.data);
        }
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch report data when selectedOrder changes
  useEffect(() => {
    const fetchOpgReport = async () => {
      if (!selectedOrder) return;
      try {
        const res = await reportService.getFullOPGReport(selectedOrder.cod_opg);
        if (!isApiError(res) && res.ok) {
          setOpgReport(res);
        }
      } catch (err) {
        console.error("Error al cargar el reporte de la OPG:", err);
      }
    };
    fetchOpgReport();
  }, [selectedOrder]);

  useEffect(() => {
    const fetchDepartureStats = async () => {
      if (departureStatsMode === "opg" && !selectedOrder) return;
      setDepartureStatsLoading(true);
      try {
        const res = await reportService.getDepartureStats(
          departureStatsMode === "opg" ? selectedOrder!.cod_opg : undefined
        );
        if (!isApiError(res) && res.ok) {
          setDepartureStats(res.data);
        }
      } catch (err) {
        console.error("Error al cargar estadísticas por partida:", err);
        setDepartureStats([]);
      } finally {
        setDepartureStatsLoading(false);
      }
    };

    fetchDepartureStats();
  }, [selectedOrder, departureStatsMode]);

  return {
    orders,
    selectedOrder,
    setSelectedOrder,
    dashboardStats,
    opgReport,
    departureStats,
    departureStatsMode,
    setDepartureStatsMode,
    departureStatsLoading,
    loading,
  };
}
