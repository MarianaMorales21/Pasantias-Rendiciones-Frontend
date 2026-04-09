import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

// 1. Interfaz de TypeScript
interface Rendicion {
  id: number;
  codigo: string;
  periodo: string;
  montoAsignado: number;
  montoGastado: number;
  sobrante: number;
  responsable: string;
  status: "Activo" | "En Revisión" | "Por Completar" | "Cerrado";
}

const rendicionesData: Rendicion[] = [
  {
    id: 1,
    codigo: "REND-2024-089",
    periodo: "Alimentación Escolar",
    montoAsignado: 15000.00,
    montoGastado: 12450.00,
    sobrante: 2550.00,
    responsable: "Dpto. IT",
    status: "En Revisión",
  },
  {
    id: 2,
    codigo: "REND-2024-088",
    periodo: "Kits de Emergencia",
    montoAsignado: 10000.00,
    montoGastado: 8900.00,
    sobrante: 1100.00,
    responsable: "Logística",
    status: "Cerrado",
  },
  {
    id: 3,
    codigo: "REND-2024-087",
    periodo: "Capacitación Docente",
    montoAsignado: 6000.00,
    montoGastado: 5200.00,
    sobrante: 800.00,
    responsable: "RRHH",
    status: "Por Completar",
  },
  {
    id: 4,
    codigo: "REND-2024-086",
    periodo: "Becas Universitarias",
    montoAsignado: 25000.00,
    montoGastado: 22000.00,
    sobrante: 3000.00,
    responsable: "Administración",
    status: "En Revisión",
  },
];

export default function RendicionesDashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    /* Contenedor con w-full para que ocupe todo el ancho */
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">

      <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Últimas Rendiciones Registradas
          </h3>
        </div>
        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition-colors">
          Ver todas
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="max-w-full overflow-x-auto">
        {/* TABLA CON w-full para forzar el ancho completo */}
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
                Monto Gastado
              </TableCell>
              <TableCell isHeader className="py-4 px-4 font-semibold text-gray-800 uppercase tracking-wider text-theme-xs text-start dark:text-white/90">
                Estado
              </TableCell>
              <TableCell isHeader className="py-4 px-4 text-gray-800 dark:text-white/90">
                Acciones
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rendicionesData.map((item) => (
              <TableRow key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                <TableCell className="py-5 px-4">
                  <span className="font-bold text-gray-800 dark:text-white/90">#{item.codigo}</span>
                </TableCell>

                <TableCell className="py-5 px-4 text-gray-600 dark:text-gray-400">
                  {item.periodo}
                </TableCell>

                <TableCell className="py-5 px-4 font-bold text-gray-800 dark:text-white">
                  {formatCurrency(item.montoGastado)}
                </TableCell>

                <TableCell className="py-5 px-4">
                  <Badge
                    size="sm"
                    color={
                      item.status === "Cerrado" ? "success" :
                        item.status === "En Revisión" ? "primary" :
                          item.status === "Por Completar" ? "error" : "warning"
                    }
                  >
                    {item.status.toUpperCase()}
                  </Badge>
                </TableCell>

                <TableCell className="py-5 px-4 text-end">
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}