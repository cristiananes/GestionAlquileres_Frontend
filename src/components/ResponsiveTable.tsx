'use client';

interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  hideOnMobile?: boolean;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  mobileCard: (item: T) => React.ReactNode;
}

export default function ResponsiveTable<T>({ columns, data, emptyMessage = "Sin datos", mobileCard }: Props<T>) {
  if (data.length === 0) {
    return <p className="text-center text-gray-500 py-12">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="p-3 font-medium">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col.key} className={`p-3 ${col.hideOnMobile ? 'hidden' : ''}`}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {data.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 space-y-2">
            {mobileCard(item)}
          </div>
        ))}
      </div>
    </>
  );
}
