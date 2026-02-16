export function DataTable({
  columns,
  rows,
  emptyText = "No data",
  caption = "Data table"
}: {
  columns: Array<{ key: string; header: string }>;
  rows: Array<Record<string, string | number>>;
  emptyText?: string;
  caption?: string;
}): JSX.Element {
  if (rows.length === 0) {
    return <div className="state-empty">{emptyText}</div>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <caption className="table-caption">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${index}-${String(row.id ?? index)}`}>
              {columns.map((column) => (
                <td key={`${index}-${column.key}`}>{row[column.key] ?? "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
