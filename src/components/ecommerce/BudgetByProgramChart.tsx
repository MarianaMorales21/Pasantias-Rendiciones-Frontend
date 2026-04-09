import  { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function BudgetByProgramChart() {
    const [viewType, setViewType] = useState<"Mensual" | "Anual">("Anual");

    // Datos simulados basados en los programas de tu captura
    const series = [
        {
            name: "Presupuesto Asignado",
            data: viewType === "Anual"
                ? [45000, 32000, 58000, 25000, 15000]
                : [4000, 2500, 5000, 2000, 1200],
        },
        {
            name: "Monto Ejecutado",
            data: viewType === "Anual"
                ? [38000, 28000, 42000, 18000, 14500]
                : [3200, 2100, 3800, 1500, 1100],
        },
    ];

    const chartOptions: ApexOptions = {
        colors: ["#465FFF", "#9CB9FF"], // Azul principal y un azul más claro para contraste
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
            categories: [
                "PROG. ALIMENTARIO",
                "SALUD RURAL",
                "INFRAEST.",
                "EDUCACIÓN",
                "EMERGENCIAS",
            ],
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
                formatter: (val) => `$${val / 1000}k`,
            },
        },
        fill: { opacity: 1 },
        tooltip: {
            y: {
                formatter: (val) => `$ ${val.toLocaleString()}`,
            },
        },
        legend: {
            position: "top",
            horizontalAlign: "left",
            fontFamily: "Outfit",
            fontWeight: 500,
            fontSize: "14px",
            markers: {
                shape: "circle", // Define la forma redondeada
                size: 6          // El tamaño del marcador
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
                        Presupuesto por Programa
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Comparativa de asignación vs ejecución
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
                        Mensual
                    </button>
                    <button
                        onClick={() => setViewType("Anual")}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewType === "Anual"
                                ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Anual
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