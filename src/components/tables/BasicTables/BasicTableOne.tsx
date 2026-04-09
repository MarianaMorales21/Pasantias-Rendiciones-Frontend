import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

export interface Column<T> {
  header: string;
  key: Extract<keyof T, string> | string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export default function BasicTableOne<T>({ columns, data }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {columns.map((col, index) => (
                <TableCell
                  key={index}
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {data.map((item, rowIndex) => (
              <TableRow key={String((item as { id?: string | number }).id || rowIndex)}>
                {columns.map((col, colIndex) => (
                  <TableCell key={colIndex} className="px-5 py-4 text-start text-theme-sm">
                    {/* Si existe una función render personalizada, la usamos; si no, mostramos el valor plano */}
                    {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}