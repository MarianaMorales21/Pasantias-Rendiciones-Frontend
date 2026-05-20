import PageMeta from "../../components/common/PageMeta";
import EcommerceMetrics from "../../components/ecommerce/Metrics";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import BudgetByProgramChart from "../../components/ecommerce/BudgetByProgramChart";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import { useDashboard } from "../../hooks/useDashboard";
import Label from "../../components/form/Label";
import RenditionExecutionTable from "../../components/ecommerce/Rendition";

export default function Home() {
  const {
    orders,
    selectedOrder,
    setSelectedOrder,
    dashboardStats,
    opgReport,
    loading,
  } = useDashboard();

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando dashboard...</div>;
  }

  return (
    <>
      <PageMeta
        title="FUNDES - Rendiciones | Home"
        description="FUNDES - Rendiciones | Home"
      />

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Dashboard de Rendiciones
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Seleccione una Orden de Pago para visualizar sus estadísticas específicas.
            </p>
          </div>
          <div className="w-full sm:w-[350px]">
            <Label htmlFor="order-selector">Orden de Pago</Label>
            <select
              id="order-selector"
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              value={selectedOrder?.cod_opg || ""}
              onChange={(e) => {
                const opg = orders.find((o) => o.cod_opg === Number(e.target.value));
                if (opg) setSelectedOrder(opg);
              }}
            >
              <option value="" disabled>Seleccione una orden...</option>
              {orders.map((o) => (
                <option key={o.cod_opg} value={o.cod_opg}>
                  Orden #{o.num_opg} - {o.fec_opg.split('T')[0]} - Bs. {o.mon_opg}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contenedor principal de 12 columnas */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* 1. Métricas */}
        <div className="col-span-12">
          <EcommerceMetrics summary={opgReport?.summary} />
        </div>

        {/* 2. Gráfico de Rendición */}
        <div className="col-span-12 lg:col-span-5">
          <MonthlyTarget summary={opgReport?.summary} />
        </div>

        {/* Estadísticas Anuales y Mensuales por Programa */}
        <div className="col-span-12 lg:col-span-7">
          <BudgetByProgramChart stats={dashboardStats} />
        </div>

        <div className="col-span-12 lg:col-span-12 mt-6">
          <RenditionExecutionTable renditions={opgReport?.renditions} />
        </div>

        {/* 3. Tabla de Rendiciones Recientes */}
        <div className="col-span-12 lg:col-span-12">
          <RecentOrders history={opgReport?.history} />
        </div>
      </div>


    </>
  );
}