import type { TableColumn } from "@/lib/types";

type DataTableProps<T extends Record<string, unknown>> = {
  caption: string;
  columns: TableColumn<T>[];
  rows: T[];
};

export function DataTable<T extends Record<string, unknown>>({
  caption,
  columns,
  rows,
}: DataTableProps<T>) {
  return (
    <details className="rounded-2xl border border-slate-900/10 bg-white/80 p-4 shadow-sm">
      <summary className="cursor-pointer text-sm font-semibold text-slate-800">
        Accessible fallback table
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-slate-800 tabular-nums">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="border-b border-slate-200 px-2 py-2 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${caption}-${rowIndex}`}>
                {columns.map((column) => {
                  const rawValue = row[column.key as keyof T];
                  const value = column.format
                    ? column.format(rawValue, row)
                    : String(rawValue ?? "-");
                  return (
                    <td
                      key={`${String(column.key)}-${rowIndex}`}
                      className="border-b border-slate-100 px-2 py-2"
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
