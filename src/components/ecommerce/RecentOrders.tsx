import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface HistoryItem {
  rendicion_nro: string;
  periodo: string;
  nota_nro: string;
  programa: string;
  concepto: string;
  monto: string | number;
  partida: string;
}

interface RecentOrdersProps {
  history?: HistoryItem[];
}

export default function RendicionesDashboard({ history = [] }: RecentOrdersProps) {
  const formatCurrency = (value: number | string) => {
    return "Bs. " + Number(value).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Historial de Gastos Asociados
          </h3>
          <p className="text-sm text-gray-500 mt-1">Detalle de cada gasto rendido en esta orden</p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table className="w-full min-w-[800px]">
          <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
            <TableRow>
              <TableCell isHeader className="py-4 px-4 font-semibold text-gray-800 uppercase tracking-wider text-theme-xs text-start dark:text-white/90">
                Referencia
              </TableCell>
              <TableCell isHeader className="py-4 px-4 font-semibold text-gray-800 uppercase tracking-wider text-theme-xs text-start dark:text-white/90">
                Programa / Período
              </TableCell>
              <TableCell isHeader className="py-4 px-4 font-semibold text-gray-800 uppercase tracking-wider text-theme-xs text-start dark:text-white/90">
                Partida
              </TableCell>
              <TableCell isHeader className="py-4 px-4 font-semibold text-gray-800 uppercase tracking-wider text-theme-xs text-start dark:text-white/90">
                Monto Gastado
              </TableCell>
              <TableCell isHeader className="py-4 px-4 text-gray-800 dark:text-white/90 text-center">
                Estado
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                  No hay gastos registrados para esta orden de pago.
                </TableCell>
              </TableRow>
            ) : (
              history.map((item, index) => (
                <TableRow key={index} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                  <TableCell className="py-5 px-4">
                    <span className="font-bold text-gray-800 dark:text-white/90 block">Rend. #{item.rendicion_nro}</span>
                    <span className="text-xs text-gray-500">Nota: {item.nota_nro}</span>
                  </TableCell>

                  <TableCell className="py-5 px-4">
                    <span className="block text-gray-800 dark:text-gray-200 font-medium">{item.programa}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">{item.periodo}</span>
                  </TableCell>

                  <TableCell className="py-5 px-4 text-gray-600 dark:text-gray-400 font-medium">
                    {item.partida}
                  </TableCell>

                  <TableCell className="py-5 px-4 font-bold text-gray-800 dark:text-white">
                    {formatCurrency(item.monto)}
                  </TableCell>

                  <TableCell className="py-5 px-4 text-center">
                    <Badge size="sm" color="success">
                      PROCESADO
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}