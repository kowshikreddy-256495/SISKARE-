import { useState } from 'react';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi2';

export default function DataTable({ columns, data, emptyMessage = 'No data found' }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortCol === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(key);
      setSortDir('asc');
    }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortCol) return 0;
    const aVal = a[sortCol] ?? '';
    const bVal = b[sortCol] ?? '';
    const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>📭</p>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} onClick={() => col.sortable !== false && handleSort(col.key)}
                style={{ cursor: col.sortable !== false ? 'pointer' : 'default', userSelect: 'none' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {col.label}
                  {sortCol === col.key && (sortDir === 'asc' ? <HiChevronUp size={14} /> : <HiChevronDown size={14} />)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
