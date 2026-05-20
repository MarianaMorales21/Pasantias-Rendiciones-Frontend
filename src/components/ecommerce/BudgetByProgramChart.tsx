import { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface ProgramStat {
    cod_pro: number;
    nom_pro: string;
    gastado_anual: number;
    gastado_mensual: number;
}

interface BudgetByProgramChartProps {
    stats?: ProgramStat[];
}

export default function BudgetByProgramChart({ stats = [] }: BudgetByProgramChartProps) {
    const [viewType, setViewType] = useState<"Mensual" | "Anual">("Anual");

    const categories = stats.map(s => s.nom_pro.substring(0, 15) + (s.nom_pro.length > 15 ? '...' : ''));
    const dataAnual = stats.map(s => Number(s.gastado_anual));
    const dataMensual = stats.map(s => Number(s.gastado_mensual));

    const series = [
        {
            name: "Monto Ejecutado",
            data: viewType === "Anual" ? dataAnual : dataMensual,
        }
    ];

    const chartOptions: ApexOptions = {
        colors: ["#465FFF"], 
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "45%",
                borderRadius: 6,
            },
        },
        dataLabels: { enabled: false },
        stroke: {
            show: true,
            width: 2,
            colors: ["transparent"],
        },
        xaxis: {
            categories: categories.length > 0 ? categories : ["Sin Datos"],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: "#64748B",
                    fontSize: "11px",
                    fontWeight: 500,
                },
            },
        },
        yaxis: {
            labels: {
                style: { colors: "#64748B" },
                formatter: (val) => {
                    if (val >= 1000000) return `Bs. ${(val / 1000000).toFixed(1)}M`;
                    if (val >= 1000) return `Bs. ${(val / 1000).toFixed(1)}k`;
                    return `Bs. ${val}`;
                },
            },
        },
        fill: { opacity: 1 },
        tooltip: {
            y: {
                formatter: (val) => `Bs. ${val.toLocaleString('es-VE')}`,
            },
        },
        legend: {
            position: "top",
            horizontalAlign: "left",
            fontFamily: "Outfit",
            fontWeight: 500,
            fontSize: "14px",
            markers: {
                shape: "circle", 
                size: 6          
            },
        },
        grid: {
            borderColor: "#E2E8F0",
            strokeDashArray: 4,
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
        },
    };

    return (
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-sm">
            {/* Header con Toggle */}
            <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
                        Gastos por Programa
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total ejecutado de todos los fondos
                    </p>
                </div>

                {/* Switch Mensual/Anual */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                    <button
                        onClick={() => setViewType("Mensual")}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewType === "Mensual"
                                ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Mes Actual
                    </button>
                    <button
                        onClick={() => setViewType("Anual")}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewType === "Anual"
                                ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Año Actual
                    </button>
                </div>
            </div>

            {/* Área del Gráfico */}
            <div className="w-full min-h-[300px]">
                <Chart
                    options={chartOptions}
                    series={series}
                    type="bar"
                    height={320}
                    width="100%"
                />
            </div>
        </div>
    );
}