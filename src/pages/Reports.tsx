import { useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import Label from "../components/form/Label";
import {
  PencilIcon,
  DownloadIcon,
  ListIcon,
  ClipboardIcon,
  FileIcon,
} from "../icons";

// ─── Tipos ──────────────────────────────────────────────────────────────────
type ReportType = "constancia" | "detalles";

// ─── Componente Vista Previa (Simulada) ──────────────────────────────────────
function ReportPreview({ type }: { type: ReportType }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-xl flex items-center justify-center min-h-[600px] border border-gray-200 dark:border-gray-700 shadow-inner">
      <div className="bg-white dark:bg-gray-900 w-full max-w-[500px] aspect-[1/1.41] shadow-2xl p-8 flex flex-col gap-6 relative overflow-hidden">
        {/* Marca de agua o decorativo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-full -mr-16 -mt-16"></div>

        {/* Encabezado del Reporte */}
        <div className="flex justify-between items-start border-b pb-4 border-gray-100 dark:border-gray-800">
          <div className="flex items-center">
            <img
              src="/images/logo/fundes.png"
              alt="FUNDES"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400">Fecha de Impresión</p>
            <p className="text-[12px] font-medium text-gray-700 dark:text-gray-300">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Título del Reporte */}
        <div className="text-center py-4">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white underline decoration-blue-500 underline-offset-4">
            {type === "constancia" ? "CONSTANCIA DE RECEPCIÓN DE RENDICIÓN" : "DETALLES DE RENDICION"}
          </h1>
        </div>

        {/* Cuerpo del Reporte (MOCK) */}
        <div className="space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-full"></div>
            <div className="h-4 bg-gray-50 dark:bg-gray-800 rounded w-1/2"></div>
          </div>
          <div className="h-32 bg-gray-50 dark:bg-gray-800 rounded w-full border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <p className="text-[10px] text-gray-400 italic">Previsualización de datos dinámicos...</p>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded w-full"></div>
            <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded w-full"></div>
            <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded w-3/4"></div>
          </div>
        </div>

        {/* Firmas Footer */}
        <div className="grid grid-cols-2 gap-12 pt-8 border-t border-gray-100 dark:border-gray-800 mt-auto">
          <div className="text-center">
            <div className="border-t border-gray-300 pt-1">
              <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase">RECIBIDO POR</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-300 pt-1">
              <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase">AUTORIZADO</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página Principal ────────────────────────────────────────────────────────
export default function Reports() {
  const [activeTab, setActiveTab] = useState<ReportType>("constancia");

  return (
    <>
      <PageMeta
        title="FUNDES - Rendiciones | Reportes"
        description="Generación y visualización de reportes financieros"
      />

      <PageBreadcrumb pageTitle="Central de Reportes" />

      {/* Selector de Pestañas Estilo Moderno */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 w-fit h-12 items-center">
        <button
          onClick={() => setActiveTab("constancia")}
          className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === "constancia"
            ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
        >
          <ClipboardIcon className="size-4" />
          Constancia de Rendición
        </button>
        <button
          onClick={() => setActiveTab("detalles")}
          className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === "detalles"
            ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
        >
          <ListIcon className="size-4" />
          Detalles Completos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* PANEL DE OPCIONES (ZONA DERECHA/LATERAL EN DESKTOP) */}
        <div className="lg:col-span-4 space-y-6 order-2 lg:order-2">
          <ComponentCard title="Opciones de Reporte">
            <div className="space-y-4">
              <div>
                <Label htmlFor="rep-prog">Programa</Label>
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                  <option value="">Todos los Programas</option>
                  <option value="1">Programa Alimentario</option>
                  <option value="2">Apoyo Educativo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rep-f-ini">Fecha Inicio</Label>
                  <input type="date" className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
                </div>
                <div>
                  <Label htmlFor="rep-f-fin">Fecha Fin</Label>
                  <input type="date" className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
                </div>
              </div>

              <div>
                <Label htmlFor="rep-ben">Beneficiario (RIF)</Label>
                <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90">
                  <option value="">Todos los Beneficiarios</option>
                  <option value="v1">V-12.345.678 - María González</option>
                  <option value="v2">V-9.876.543 - José Ramírez</option>
                </select>
              </div>

              <div className="pt-4 space-y-3">
                <Button className="w-full flex justify-center gap-2 items-center bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl py-3 shadow-lg shadow-black/20 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40">
                  <FileIcon className="size-4" />
                  Aplicar Filtros
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="flex justify-center gap-2 items-center rounded-xl border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
                    <DownloadIcon className="size-4" />
                    PDF
                  </Button>
                  <Button variant="outline" className="flex justify-center gap-2 items-center rounded-xl border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
                    <PencilIcon className="size-4" />
                    Imprimir
                  </Button>
                </div>
              </div>
            </div>
          </ComponentCard>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-4 rounded-xl">
            <div className="flex gap-3">
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0">
                <ClipboardIcon className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Ayuda</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Los reportes se generan basándose en las rendiciones cargadas en el sistema. Puedes filtrar por fecha para obtener periodos específicos.</p>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DE PREVISUALIZACIÓN (ZONA IZQUIERDA EN DESKTOP) */}
        <div className="lg:col-span-8 order-1 lg:order-1">
          <ComponentCard title="Vista Previa de Documento">
            <ReportPreview type={activeTab} />
          </ComponentCard>
        </div>
      </div>
    </>
  );
}
