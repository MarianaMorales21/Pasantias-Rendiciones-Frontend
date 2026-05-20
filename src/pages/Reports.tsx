import { useState, useRef, useEffect, useMemo } from "react";
import { useReports } from "../hooks/useReports";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import Button from "../components/ui/button/Button";
import { useAuthorities } from "../hooks/useAuthorities";
import { SearchableSelect } from "../components/form/SearchableSelect";
import {
  FileIcon,
  DownloadIcon,
  ListIcon,
  ClipboardIcon,
  FileIcon as FormIcon,
} from "../icons";

// Importación de componentes de reportes organizados
import { DetailedReportPreview } from "../components/reports/DetailedReport";
import { ActaPreview } from "../components/reports/ActaEntrega";
import { SolicitudFormaPreview } from "../components/reports/SolicitudForma";
import { SolicitudCartaPreview } from "../components/reports/SolicitudCarta";
import { ActaSummary } from "../types/reports";

// Importación centralizada de generadores PDF
import {
  exportDetailedPDF,
  exportActaPDF,
  exportSolicitudFormaPDF,
  exportSolicitudCartaPDF
} from "../utils/pdfGenerators";

// ─── COMPONENTE AUXILIAR: VISTA PREVIA VACÍA ──────────────────────────────────

function EmptyPreview({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400 dark:text-gray-500">
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4 border border-gray-200 dark:border-gray-700">
        <FileIcon className="size-16 opacity-20" />
      </div>
      <p className="text-base font-medium italic">{message}</p>
    </div>
  );
}

// ─── COMPONENTE AUXILIAR: CARGANDO ────────────────────────────────────────────

function LoadingPreview() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="size-12 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mb-4" />
      <p className="text-base font-bold text-gray-600 dark:text-gray-300 animate-pulse">Generando vista previa...</p>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

type TabType = "detalle" | "acta" | "solicitud_forma" | "solicitud_carta";

export default function Reports() {
  const [activeTab, setActiveTab] = useState<TabType>("detalle");
  const previewRef = useRef<HTMLDivElement>(null);
  const {
    renditionList,
    selectedRnd,
    handleSelectRnd,
    detailedReport,
    loading,
    fetchDetailedReport,
  } = useReports();

  const { authorities } = useAuthorities();

  const currentRndInfo = useMemo(() => {
    return renditionList.find(r => r.cod_rnd === selectedRnd);
  }, [renditionList, selectedRnd]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rndId = params.get("rnd");
    if (rndId) {
      handleSelectRnd(Number(rndId));
      fetchDetailedReport(Number(rndId));
    }
  }, [handleSelectRnd, fetchDetailedReport]);
  

  const handleExportPDF = async () => {
    if (!detailedReport) return;
    if (activeTab === "detalle") await exportDetailedPDF(detailedReport, authorities);
    else if (activeTab === "acta") await exportActaPDF(detailedReport, authorities);
    else if (activeTab === "solicitud_forma") await exportSolicitudFormaPDF(detailedReport, authorities);
    else if (activeTab === "solicitud_carta") await exportSolicitudCartaPDF(detailedReport, authorities);
  };

  const handleGenerate = () => {
    if (selectedRnd) fetchDetailedReport(selectedRnd);
  };

  // Calculamos las estadísticas en tiempo real basándonos en el selector
  const summary = useMemo<ActaSummary | undefined>(() => {
    return detailedReport?.summary as unknown as ActaSummary;
  }, [detailedReport]);

  // 2. Lógica de visualización (Stats)
  const displayStats = useMemo(() => {
    // Si el reporte ya existe y tiene el summary inyectado
    if (summary) {
      return {
        porcentaje: summary.porcentajeRendido ?? 0,
        porRendir: summary.montoPorRendirFmt ?? "0,00",
      };
    }


    return { porcentaje: 0, porRendir: "0,00" };
  }, [summary]);

  return (
    <div className="min-h-screen pb-12 bg-gray-50/30 dark:bg-gray-950/20">
      <PageMeta title="Reportes | Rendiciones" description="Generación de reportes" />
      <PageBreadcrumb pageTitle="Generación de Reportes e Instrumentos" />

      {/* SECCIÓN DE CONFIGURACIÓN SUPERIOR */}
      <div className="mb-8">
        <ComponentCard title="Configuración y Estadísticas de la Rendición">
          <div className="flex flex-col lg:flex-row items-end gap-5">

            {/* SELECTOR */}
            <div className="w-full lg:w-80">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-2 ml-1">Seleccionar Rendición</label>
              <SearchableSelect
                options={renditionList.map((rnd) => ({
                  value: rnd.cod_rnd,
                  label: `RND 0${rnd.num_rnd} — OPG ${rnd.num_opg}`,
                }))}
                value={selectedRnd === "" ? null : selectedRnd}
                onChange={(val) => handleSelectRnd(val === null ? "" : val)}
                placeholder="Escriba o seleccione rendición..."
              />
            </div>

            {/* CUADROS INFORMATIVOS - MÁS AZULADOS Y GRANDES */}
            <div className="flex-1 grid grid-cols-4 gap-4 w-full h-12">
              {/* CUADROS INFORMATIVOS */}


              {/* ORDEN DE PAGO */}
              <div className="bg-blue-100/40 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl flex flex-col items-center justify-center transition-colors p-2">
                <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase leading-none mb-1">ORDEN DE PAGO</span>
                <span className="text-sm font-black text-gray-900 dark:text-white leading-none">{currentRndInfo?.num_opg || "---"}</span>
              </div>

              {/* RENDICIÓN Nº */}
              <div className="bg-blue-100/40 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl flex flex-col items-center justify-center transition-colors p-2">
                <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase leading-none mb-1">RENDICIÓN Nº</span>
                <span className="text-sm font-black text-gray-900 dark:text-white leading-none">{currentRndInfo ? `0${currentRndInfo.num_rnd}` : "---"}</span>
              </div>

              {/* % RENDIDO */}
              {/* % RENDIDO */}
              <div className="bg-blue-100/40 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-xl flex flex-col items-center justify-center transition-colors p-2">
                <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase leading-none mb-1">% RENDIDO</span>
                <span className="text-[11px] font-black text-gray-900 dark:text-white leading-none">
                  {displayStats.porcentaje}%
                </span>
              </div>

              {/* POR RENDIR EN DINERO */}
              <div className="bg-emerald-100/40 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-xl flex flex-col items-center justify-center transition-colors p-2">
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase leading-none mb-1">POR RENDIR (BS.)</span>
                <span className="text-[11px] font-black text-gray-900 dark:text-white leading-none">
                  {displayStats.porRendir}
                </span>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Button
                onClick={handleGenerate}
                disabled={!selectedRnd || loading}
                className="flex-1 lg:w-40 h-12 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl px-6 py-2.5 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40"
              >
                GENERAR
              </Button>

              <button
                onClick={handleExportPDF}
                disabled={!detailedReport || loading}
                className={`flex items-center justify-center gap-2 px-6 h-12 rounded-xl font-black text-[11px] tracking-tight transition-all duration-300 active:scale-95 shadow-lg shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/40 ${!detailedReport || loading
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed shadow-none"
                  : "bg-red-600 hover:bg-red-700 text-white shadow-red-900/20"
                  }`}
              >
                <DownloadIcon className="size-5" />
                <span className="hidden sm:inline">EXPORTAR PDF</span>
              </button>
            </div>

          </div>
        </ComponentCard>
      </div>

      {/* SECCIÓN DE TABS ESTILO CARPETA */}
      <div className="max-w-[98%] mx-auto">
        <div className="flex items-end pl-2 space-x-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "detalle", label: "DETALLE DE GASTOS", icon: ListIcon },
            { id: "acta", label: "ACTA DE ENTREGA", icon: ClipboardIcon },
            { id: "solicitud_forma", label: "SOLICITUD (FORMATO)", icon: FormIcon },
            { id: "solicitud_carta", label: "SOLICITUD (CARTA)", icon: FileIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`relative flex items-center gap-3 px-10 py-4 text-[11px] font-black tracking-widest transition-all duration-300 ${activeTab === tab.id
                ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 rounded-t-2xl border-t-2 border-x-2 border-gray-200 dark:border-gray-700 z-10 shadow-[0_-8px_20px_-8px_rgba(0,0,0,0.12)]"
                : "bg-gray-200/60 dark:bg-gray-800/40 text-gray-500 dark:text-gray-500 rounded-t-xl border-t border-x border-transparent mb-0 hover:bg-gray-100 dark:hover:bg-gray-800/80"
                }`}
            >
              <tab.icon className={`size-4.5 ${activeTab === tab.id ? "text-blue-500" : ""}`} />
              <span className="whitespace-nowrap">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute -bottom-1.5 left-0 right-0 h-4 bg-white dark:bg-gray-900 z-20" />
              )}
            </button>
          ))}
        </div>

        {/* CONTENEDOR DE LA CARPETA */}
        <div className="bg-white dark:bg-gray-900 rounded-b-[2.5rem] rounded-tr-[2.5rem] border-2 border-gray-200 dark:border-gray-700 shadow-2xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
          <div className="p-1 md:p-8 bg-gray-50/50 dark:bg-gray-950/20">
            <div
              ref={previewRef}
              className="overflow-auto min-h-[800px] max-h-[1200px] bg-white dark:bg-gray-900 rounded-[2rem] shadow-inner border border-gray-200/50 dark:border-gray-800 p-2 md:p-12"
            >
              {loading ? (
                <LoadingPreview />
              ) : activeTab === "detalle" ? (
                detailedReport ? <DetailedReportPreview data={detailedReport} authorities={authorities} /> : <EmptyPreview message='Seleccione una rendición y genere el reporte' />
              ) : activeTab === "acta" ? (
                detailedReport ? <ActaPreview data={detailedReport} authorities={authorities} /> : <EmptyPreview message='Seleccione una rendición y genere el reporte' />
              ) : activeTab === "solicitud_forma" ? (
                detailedReport ? <SolicitudFormaPreview data={detailedReport} authorities={authorities} /> : <EmptyPreview message='Seleccione una rendición y genere el reporte' />
              ) : detailedReport ? (
                <SolicitudCartaPreview data={detailedReport} authorities={authorities} />
              ) : (
                <EmptyPreview message='Seleccione una rendición y genere el reporte' />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
