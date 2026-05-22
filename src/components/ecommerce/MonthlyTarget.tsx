import { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface MonthlyTargetProps {
  summary?: {
    monto_inicial_fmt: string;
    total_ejecutado_fmt: string;
    saldo_disponible_fmt: string;
    monto_inicial: number;
    total_ejecutado: number;
    saldo_disponible: number;
  };
}

export default function RendicionTargetCard({ summary }: MonthlyTargetProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Valores predeterminados si no hay resumen
  const montoAsignado = summary?.monto_inicial || 0;
  const montoRendido = summary?.total_ejecutado || 0;
  const montoPendiente = Math.max(0, summary?.saldo_disponible || 0);

  // Lógica de Cálculos
  const porcentajeRendido = montoAsignado > 0 
    ? parseFloat(((montoRendido / montoAsignado) * 100).toFixed(2))
    : 0;
  
  const estatus = porcentajeRendido >= 100 ? "Cerrado" : (porcentajeRendido > 0 ? "En Progreso" : "Por Completar");

  // Formateador de Moneda
  const fCurrency = (val: number) =>
    new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "VES",
    }).format(val);

  // Configuración del Gráfico ApexCharts
  const chartOptions: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: { size: "75%" },
        track: {
          background: "#E4E7EC",
          strokeWidth: "95%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: "14px",
            fontWeight: "500",
            offsetY: 45,
            color: "#64748B",
          },
          value: {
            fontSize: "32px",
            fontWeight: "700",
            offsetY: -40,
            color: "#1D2939",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        gradientToColors: ["#8091FF"],
        stops: [0, 100],
      },
    },
    stroke: { lineCap: "round" },
    labels: ["Total Rendido"],
  };

  return (
    <div className="max-w-md mx-auto rounded-3xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="rounded-[22px] bg-white p-6 shadow-sm dark:bg-gray-900">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
              Progreso de Ejecución
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Orden de Pago Seleccionada
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-800 z-10">
                <button className="flex w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5 rounded-lg">Ver Detalles</button>
              </div>
            )}
          </div>
        </div>

        {/* Chart Section */}
        <div className="relative mt-4 flex justify-center">
          <Chart
            options={chartOptions}
            series={[porcentajeRendido]}
            type="radialBar"
            height={300}
            width="100%"
          />
          <div className="absolute bottom-6">
            <span className={`rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider ${estatus === "Cerrado"
                ? "bg-green-100 text-green-600"
                : "bg-amber-100 text-amber-600"
              }`}>
              {estatus}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="mt-4 text-center text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Se ha justificado el <span className="font-bold text-gray-800 dark:text-white">{porcentajeRendido}%</span> de los fondos recibidos. Quedan {fCurrency(montoPendiente)} por rendir.
        </p>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-around py-5 px-2">
        <StatGroup label="Asignado" value={fCurrency(montoAsignado)} />
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-800" />
        <StatGroup
          label="Rendido"
          value={fCurrency(montoRendido)}
          valueClass="text-green-600 dark:text-green-400"
        />
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-800" />
        <StatGroup
          label="Pendiente"
          value={fCurrency(montoPendiente)}
          valueClass="text-orange-500"
        />
      </div>
    </div>
  );
}

// Sub-componente para organizar las métricas inferiores
function StatGroup({ label, value, valueClass = "text-gray-800 dark:text-white" }: { label: string, value: string, valueClass?: string }) {
  return (
    <div className="text-center">
      <p className="text-[11px] font-medium uppercase tracking-tight text-gray-400 dark:text-gray-500">
        {label}
      </p>
      <p className={`mt-0.5 text-sm font-bold sm:text-base ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}