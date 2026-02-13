import type { BaseDatasetBundle } from "@/lib/types";

const numberFmt = new Intl.NumberFormat("en-US");

type LibraryDataTableProps = {
  data: BaseDatasetBundle;
};

export function LibraryDataTable({ data }: LibraryDataTableProps) {
  const rows = data.countries.slice(0, 8);

  return (
    <details className="rounded-2xl border border-black/10 bg-[var(--paper)] p-4">
      <summary className="cursor-pointer text-sm font-semibold text-ink">Accessible Data Table</summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-ink tabular-nums">
          <caption className="sr-only">Country fallback table</caption>
          <thead>
            <tr>
              <th className="border-b border-black/10 px-2 py-2">Country</th>
              <th className="border-b border-black/10 px-2 py-2">Region</th>
              <th className="border-b border-black/10 px-2 py-2">Population</th>
              <th className="border-b border-black/10 px-2 py-2">Area</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td className="border-b border-black/5 px-2 py-2">{row.name}</td>
                <td className="border-b border-black/5 px-2 py-2">{row.region}</td>
                <td className="border-b border-black/5 px-2 py-2">{numberFmt.format(row.population)}</td>
                <td className="border-b border-black/5 px-2 py-2">{numberFmt.format(row.area)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
