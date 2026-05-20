import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
  DollarLineIcon,
  ClipboardIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

interface MetricsProps {
  summary?: {
    monto_inicial_fmt: string;
    total_ejecutado_fmt: string;
    saldo_disponible_fmt: string;
    monto_inicial: number;
    total_ejecutado: number;
    saldo_disponible: number;
    total_rendiciones: number;
  };
}

export default function Metrics({ summary }: MetricsProps) {
  const formatValue = (val?: string) => (val ? `Bs. ${val}` : "Bs. 0.00");
  const calculatePercentage = (part: number, total: number) => {
    if (!total || total === 0) return "0.0%";
    return ((part / total) * 100).toFixed(1) + "%";
  };

  const executedPct = summary ? calculatePercentage(summary.total_ejecutado, summary.monto_inicial) : "0.0%";
  const availablePct = summary ? calculatePercentage(summary.saldo_disponible, summary.monto_inicial) : "0.0%";
  const totalRendicionesStr = summary && summary.total_rendiciones !== undefined 
    ? summary.total_rendiciones.toString() 
    : "0";

  const metricsData = [
    {
      title: "Presupuesto Total",
      value: formatValue(summary?.monto_inicial_fmt),
      icon: <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />,
      change: "Asignado",
      changeType: "neutral",
      borderColor: "border-l-blue-600 dark:dark:border-l-blue-700/90",
    },
    {
      title: "Total Rendido",
      value: formatValue(summary?.total_ejecutado_fmt),
      icon: <DollarLineIcon className="text-gray-800 size-6 dark:text-white/90" />,
      change: executedPct,
      changeType: "success",
      borderColor: "border-l-cyan-400 dark:dark:border-l-cyan-700/80",
    },
    {
      title: "Sobrante",
      value: formatValue(summary?.saldo_disponible_fmt),
      icon: <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />,
      change: availablePct,
      changeType: "success",
      borderColor: "border-l-teal-500 dark:border-l-teal-700/80",
    },
    {
      title: "Rendiciones",
      value: totalRendicionesStr,
      icon: <ClipboardIcon className="text-gray-800 size-6 dark:text-white/90" />,
      change: totalRendicionesStr === "1" ? "Realizada" : "Realizadas",
      changeType: "neutral",
      borderColor: "border-l-red-500 dark:border-l-red-700/90",
    },
  ];

  return (
    <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {metricsData.map((metric, index) => (
        <div
          key={index}
          className={`
            relative w-full p-5 md:p-6
            rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]
            /* Borde dinámico con soporte para modo oscuro opaco */
            border-l-[6px] ${metric.borderColor}
            /* Sombra negra base */
            shadow-[0_10px_20px_rgba(0,0,0,0.1)] 
            dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]
            /* Animación y Levante */
            transition-all duration-300 ease-in-out
            hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]
            dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)]
            cursor-default
          `}
        >
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            {metric.icon}
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {metric.title}
              </span>
              <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90 truncate max-w-[150px]">
                {metric.value}
              </h4>
            </div>

            <Badge color={metric.changeType === "success" ? "success" : metric.changeType === "error" ? "error" : "light"}>
              {metric.changeType === "success" && <ArrowUpIcon />}
              {metric.changeType === "error" && <ArrowDownIcon />}
              {metric.change}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}