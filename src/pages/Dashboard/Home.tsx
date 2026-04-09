import EcommerceMetrics from "../../components/ecommerce/Metrics";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import PageMeta from "../../components/common/PageMeta";
import BudgetByProgramChart from "../../components/ecommerce/BudgetByProgramChart";

export default function Home() {
  return (
    <>
      <PageMeta
        title="FUNDES - Rendiciones | Home"
        description="FUNDES - Rendiciones | Home"
      />

      {/* Contenedor principal de 12 columnas */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">

        {/* 1. Métricas: col-span-12 para que ocupen todo el ancho horizontal */}
        <div className="col-span-12">
          <EcommerceMetrics />
        </div>

        {/* 2. Gráfico de Rendición: 
            Ocupa 12 columnas en móvil, y 5 en pantallas grandes (Laptops) 
        */}
        <div className="col-span-12 lg:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12 lg:col-span-7">
          <BudgetByProgramChart />
        </div>

        {/* 3. Tabla de Órdenes: 
            Ocupa 12 columnas en móvil, y 7 en pantallas grandes para compensar al gráfico
        */}
        <div className="col-span-12 lg:col-span-12">
          <RecentOrders />
        </div>

      </div>
    </>
  );
}