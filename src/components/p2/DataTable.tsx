import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  searchPlaceholder?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns, data, onRowClick, loading, searchPlaceholder = 'Search...',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(row => columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q)));
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const paged = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="p2-card overflow-hidden">
      {/* Search bar */}
      <div className="p-4 border-b border-[--p2-gray-200] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--p2-gray-400]" />
          <input
            type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[--p2-gray-200] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[--p2-blue]/30 focus:border-[--p2-blue]"
          />
        </div>
        <select value={perPage} onChange={e => { setPerPage(+e.target.value); setPage(0); }}
          className="text-xs border border-[--p2-gray-200] rounded-md px-2 py-1.5 bg-white text-[--p2-gray-600]">
          {[10, 25, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[--p2-gray-200] bg-[--p2-gray-50]">
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[--p2-gray-500]">
                  {col.sortable ? (
                    <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-[--p2-navy]">
                      {col.label}
                      {sortKey === col.key ? (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronsUpDown size={14} className="opacity-30" />}
                    </button>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[--p2-gray-100]">
                  {columns.map(col => <td key={col.key} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                </tr>
              ))
            ) : paged.length === 0 ? (
              <tr><td colSpan={columns.length}><EmptyState title="No results" description="Try adjusting your search." /></td></tr>
            ) : (
              paged.map((row, i) => (
                <tr key={i} onClick={() => onRowClick?.(row)}
                  className={cn('border-b border-[--p2-gray-100] transition-colors hover:bg-[--p2-blue]/[0.03]', onRowClick && 'cursor-pointer')}>
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-[--p2-gray-700]">
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-[--p2-gray-200] flex items-center justify-between text-xs text-[--p2-gray-500]">
          <span>{sorted.length} results</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={cn('w-7 h-7 rounded-md font-medium', page === i ? 'bg-[--p2-blue] text-white' : 'hover:bg-[--p2-gray-100]')}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
