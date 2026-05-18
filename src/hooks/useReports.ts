import { useState, useEffect, useCallback } from "react";
import { reportService } from "../services/reportsService";
import {
  FullDetailedReport,
  FullActaReport,
  RenditionListItem,
} from "../types/reports";
import { isApiError } from "../helpers/helpHttp";

export function useReports() {
  const [renditionList, setRenditionList] = useState<RenditionListItem[]>([]);
  const [selectedRnd, setSelectedRnd] = useState<number | "">("");
  const [detailedReport, setDetailedReport] = useState<FullDetailedReport | null>(null);
  const [actaReport, setActaReport] = useState<FullActaReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga la lista de rendiciones al montar
  useEffect(() => {
    const fetchList = async () => {
      setLoadingList(true);
      try {
        const res = await reportService.getRenditionList();
        if (isApiError(res)) throw new Error(res.statusText || "Error al cargar rendiciones");
        setRenditionList(res.data);
      } catch (err) {
        console.error("Error cargando lista de rendiciones:", err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchList();
  }, []);

  // Cuando cambia la rendición seleccionada, limpia los reportes anteriores
  const handleSelectRnd = useCallback((cod_rnd: number | "") => {
    setSelectedRnd(cod_rnd);
    setDetailedReport(null);
    setActaReport(null);
    setError(null);
  }, []);

  // Genera el reporte detallado
  const fetchDetailedReport = useCallback(async (overrideId?: number) => {
    const targetId = overrideId || selectedRnd;
    if (!targetId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getDetailedReport(targetId);
      if (isApiError(res)) throw new Error(res.statusText || "Error al generar reporte detallado");
      setDetailedReport(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setDetailedReport(null);
    } finally {
      setLoading(false);
    }
  }, [selectedRnd]);

  // Genera el acta de entrega
  const fetchActaReport = useCallback(async (overrideId?: number) => {
    const targetId = overrideId || selectedRnd;
    if (!targetId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getActaReport(targetId);
      if (isApiError(res)) throw new Error(res.statusText || "Error al generar acta");
      setActaReport(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setActaReport(null);
    } finally {
      setLoading(false);
    }
  }, [selectedRnd]);

  return {
    renditionList,
    selectedRnd,
    handleSelectRnd,
    detailedReport,
    actaReport,
    loading,
    loadingList,
    error,
    fetchDetailedReport,
    fetchActaReport,
  };
}