import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
  DollarLineIcon,
  ClipboardIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

export default function Metrics() {
  const metricsData = [
    {
      title: "Presupuesto Total",
      value: "$25,000.00",
      icon: <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />,
      change: "Anual 2026",
      changeType: "neutral",
      // Azul sólido en light, azul oscuro/opaco en dark
      borderColor: "border-l-blue-600 dark:dark:border-l-blue-700/90",
    },
    {
      title: "Total Rendido",
      value: "$15,850.25",
      icon: <DollarLineIcon className="text-gray-800 size-6 dark:text-white/90" />,
      change: "63.4%",
      changeType: "success",
      // Cian vibrante en light, cian petróleo opaco en dark
      borderColor: "border-l-cyan-400 dark:dark:border-l-cyan-700/80",
    },
    {
      title: "Sobrante",
      value: "$9,149.75",
      icon: <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />,
      change: "Disponible",
      changeType: "success",
      // Teal en light, verde bosque muy oscuro en dark
      borderColor: "border-l-teal-500 dark:border-l-teal-700/80",
    },
    {
      title: "Rendiciones Pendientes",
      value: "12",
      icon: <ClipboardIcon className="text-gray-800 size-6 dark:text-white/90" />,
      change: "Importante",
      changeType: "error",
      // Rojo alerta en light, rojo vino profundo en dark
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
              <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
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