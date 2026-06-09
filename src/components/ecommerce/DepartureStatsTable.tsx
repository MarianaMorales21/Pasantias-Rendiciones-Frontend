import { DepartureStatItem } from "../../types/reports";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

interface DepartureStatsTableProps {
  stats: DepartureStatItem[];
  loading: boolean;
  mode: "opg" | "annual";
  setMode: (mode: "opg" | "annual") => void;
  orderNumber?: string;
}

export default function DepartureStatsTable({
  stats = [],
  loading,
  mode,
  setMode,
  orderNumber = "",
}: DepartureStatsTableProps) {
  const formatCurrency = (val: string | number) => {
    const num = Number(val) || 0;
    return "Bs. " + num.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-sm">
      {/* Header con Toggle */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
            Gastos por Partida Presupuestaria
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {mode === "opg"
              ? `Estadísticas de gasto para la Orden de Pago #${orderNumber}`
              : "Acumulado de gasto anual de todas las partidas"}
          </p>
        </div>

        {/* Toggle Orden Seleccionada / Año Actual */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
          <button
            onClick={() => setMode("opg")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === "opg"
                ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Orden de Pago
          </button>
          <button
            onClick={() => setMode("annual")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === "annual"
                ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Año Actual
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="max-w-full overflow-x-auto">
        <Table className="w-full min-w-[600px]">
          <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 px-4 font-semibold text-gray-800 uppercase tracking-wider text-theme-xs text-start dark:text-white/90"
              >
                Partida
              </TableCell>
              <TableCell
                isHeader
                className="py-3 px-4 font-semibold text-gray-800 uppercase tracking-wider text-theme-xs text-start dark:text-white/90"
              >
                Nombre de la Partida
              </TableCell>
              <TableCell
                isHeader
                className="py-3 px-4 font-semibold text-gray-800 uppercase tracking-wider text-theme-xs text-start dark:text-white/90"
              >
                Total Gastado
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="p-8 text-center text-gray-400 font-medium">
                  Cargando estadísticas...
                </TableCell>
              </TableRow>
            ) : stats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="p-8 text-center text-gray-400 font-medium">
                  No hay gastos registrados en esta selección.
                </TableCell>
              </TableRow>
            ) : (
              stats.map((item, index) => (
                <TableRow
                  key={item.cod_par || index}
                  className="border-b border-gray-100 dark:border-gray-800/80 hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="p-4">
                    <span className="font-semibold text-gray-800 dark:text-white/90">
                      {item.num_par}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {item.nom_par}
                  </td>
                  <td className="p-4 font-bold text-gray-800 dark:text-gray-200">
                    {formatCurrency(item.total_gastado)}
                  </td>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
