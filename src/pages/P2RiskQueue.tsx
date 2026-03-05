import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Download, Eye, UserPlus, CheckSquare, Filter,
  ChevronDown
} from 'lucide-react';
import { PageHeader } from '@/components/p2/PageHeader';
import { ScoreCircle } from '@/components/p2/ScoreCircle';
import { StatusBadge } from '@/components/p2/StatusBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// ── Types ──
type CaseStatus = 'PENDING' | 'PROCESSING' | 'CLEARED' | 'FLAGGED' | 'DENIED';

interface QueueCase {
  id: string;
  name: string;
  passport: string;
  nationality: string;
  nationalityCode: string;
  riskScore: number;
  status: CaseStatus;
  submitted: string;
  hoursAgo: number;
  assignedTo: string | null;
  assignedAvatar: string | null;
}

// ── Flag map ──
const FLAG: Record<string, string> = {
  TR: '🇹🇷', IR: '🇮🇷', AF: '🇦🇫', SY: '🇸🇾', LB: '🇱🇧', MA: '🇲🇦',
  PK: '🇵🇰', NG: '🇳🇬', IQ: '🇮🇶', EG: '🇪🇬', IN: '🇮🇳', BD: '🇧🇩',
  SO: '🇸🇴', YE: '🇾🇪', TN: '🇹🇳', DZ: '🇩🇿', JO: '🇯🇴', UA: '🇺🇦',
  GE: '🇬🇪', AZ: '🇦🇿', RU: '🇷🇺', CN: '🇨🇳', UZ: '🇺🇿', KZ: '🇰🇿',
};

const NATIONALITIES = [
  { code: 'TR', name: 'Turkey' }, { code: 'IR', name: 'Iran' }, { code: 'AF', name: 'Afghanistan' },
  { code: 'SY', name: 'Syria' }, { code: 'LB', name: 'Lebanon' }, { code: 'MA', name: 'Morocco' },
  { code: 'PK', name: 'Pakistan' }, { code: 'NG', name: 'Nigeria' }, { code: 'IQ', name: 'Iraq' },
  { code: 'EG', name: 'Egypt' }, { code: 'IN', name: 'India' }, { code: 'BD', name: 'Bangladesh' },
  { code: 'SO', name: 'Somalia' }, { code: 'YE', name: 'Yemen' }, { code: 'TN', name: 'Tunisia' },
  { code: 'DZ', name: 'Algeria' }, { code: 'JO', name: 'Jordan' }, { code: 'UA', name: 'Ukraine' },
  { code: 'GE', name: 'Georgia' }, { code: 'AZ', name: 'Azerbaijan' }, { code: 'RU', name: 'Russia' },
  { code: 'CN', name: 'China' }, { code: 'UZ', name: 'Uzbekistan' }, { code: 'KZ', name: 'Kazakhstan' },
];

const ALL_STATUSES: CaseStatus[] = ['PENDING', 'PROCESSING', 'FLAGGED', 'CLEARED', 'DENIED'];

const OFFICERS = ['Elif Demir', 'Burak Aydın', 'Selin Kaya', null, null];

// ── Mock data ──
function rtime(h: number): string {
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  return `${d} days ago`;
}

const MOCK_QUEUE: QueueCase[] = Array.from({ length: 50 }, (_, i) => {
  const nat = NATIONALITIES[i % NATIONALITIES.length];
  const names = [
    'Ahmet Kılıç','Reza Mohammadi','Fatima Noori','Hassan Al-Ibrahim','Layla Hariri',
    'Youssef El Amrani','Zainab Bibi','Emeka Eze','Mustafa Karimi','Sara El-Sayed',
    'Raj Patel','Tahmina Akter','Abdirahman Nur','Salim Al-Rashidi','Amira Bouaziz',
    'Djamila Benmoussa','Nour Haddad','Oleksandr Shevchenko','Nino Tsereteli','Rashad Aliyev',
    'Dmitri Volkov','Wei Zhang','Dilshod Karimov','Arman Tokayev','Ceren Yılmaz',
    'Parisa Hosseini','Mariam Stanikzai','Omar Jaber','Nadine Chamoun','Khalid Bennani',
    'Imran Qureshi','Blessing Okonkwo','Ali Husseini','Huda Saleh','Sami Ben Youssef',
    'Nadia Mesbah','Rania Awad','Mykola Kovalchuk','Giorgi Kvirtia','Leyla Hajiyeva',
    'Sergei Petrov','Ling Chen','Nodira Yuldasheva','Bekzat Nursultan','Kemal Öztürk',
    'Darya Rahimi','Zahra Kargar','Firas Mansour','Maya Khoury','Ismail Toure',
  ];
  const score = Math.floor(Math.random() * 90) + 5;
  const h = Math.floor(Math.random() * 168);
  const statusPool: CaseStatus[] = score > 75
    ? ['FLAGGED', 'PENDING', 'DENIED']
    : score > 40
      ? ['PROCESSING', 'PENDING', 'FLAGGED']
      : ['CLEARED', 'PENDING', 'PROCESSING'];
  const officer = OFFICERS[Math.floor(Math.random() * OFFICERS.length)];

  return {
    id: `VIS-2026-${1100 + i}`,
    name: names[i],
    passport: `${nat.code}${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
    nationality: nat.name,
    nationalityCode: nat.code,
    riskScore: score,
    status: statusPool[Math.floor(Math.random() * statusPool.length)],
    submitted: rtime(h),
    hoursAgo: h,
    assignedTo: officer,
    assignedAvatar: officer ? officer.split(' ').map(w => w[0]).join('') : null,
  };
}).sort((a, b) => b.riskScore - a.riskScore);

// ── Component ──
export default function P2RiskQueue() {
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<CaseStatus[]>([]);
  const [riskRange, setRiskRange] = useState<[number, number]>([0, 100]);
  const [selectedNats, setSelectedNats] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [natSearch, setNatSearch] = useState('');

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Sort
  const [sortKey, setSortKey] = useState<string>('riskScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [page, setPage] = useState(0);
  const perPage = 15;

  const activeFilterCount = [
    search ? 1 : 0,
    selectedStatuses.length ? 1 : 0,
    (riskRange[0] !== 0 || riskRange[1] !== 100) ? 1 : 0,
    selectedNats.length ? 1 : 0,
    (dateFrom || dateTo) ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const filtered = useMemo(() => {
    return MOCK_QUEUE.filter(c => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.passport.toLowerCase().includes(q)) return false;
      }
      if (selectedStatuses.length && !selectedStatuses.includes(c.status)) return false;
      if (c.riskScore < riskRange[0] || c.riskScore > riskRange[1]) return false;
      if (selectedNats.length && !selectedNats.includes(c.nationalityCode)) return false;
      return true;
    });
  }, [search, selectedStatuses, riskRange, selectedNats]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = (a as any)[sortKey];
      const bv = (b as any)[sortKey];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const paged = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const toggleStatus = (s: CaseStatus) => {
    setSelectedStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    setPage(0);
  };

  const toggleNat = (code: string) => {
    setSelectedNats(prev => prev.includes(code) ? prev.filter(x => x !== code) : [...prev, code]);
    setPage(0);
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map(c => c.id)));
  };

  const clearFilters = () => {
    setSearch(''); setSelectedStatuses([]); setRiskRange([0, 100]); setSelectedNats([]); setDateFrom(undefined); setDateTo(undefined); setPage(0);
  };

  const SortHeader = ({ label, colKey }: { label: string; colKey: string }) => (
    <button onClick={() => toggleSort(colKey)} className="flex items-center gap-1 hover:text-[--p2-navy]">
      {label}
      {sortKey === colKey && <ChevronDown size={12} className={cn('transition-transform', sortDir === 'asc' && 'rotate-180')} />}
    </button>
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Risk Queue"
        subtitle="Cases requiring review, sorted by risk score"
        actions={
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-[--p2-gray-200] text-[--p2-gray-600]">
            <Download size={14} /> Export CSV
          </Button>
        }
      />

      {/* ── Filter Bar ── */}
      <div className="p2-card p-3 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative w-56">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[--p2-gray-400]" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Name or passport..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-[--p2-gray-200] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[--p2-blue]/30 focus:border-[--p2-blue]"
          />
        </div>

        {/* Status multi-select */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[--p2-gray-200] rounded-md bg-white hover:bg-[--p2-gray-50] text-[--p2-gray-600]">
              <Filter size={12} /> Status {selectedStatuses.length > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-[--p2-blue] text-white">{selectedStatuses.length}</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-2" align="start">
            {ALL_STATUSES.map(s => (
              <label key={s} className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-[--p2-gray-50] rounded cursor-pointer">
                <Checkbox checked={selectedStatuses.includes(s)} onCheckedChange={() => toggleStatus(s)} className="h-3.5 w-3.5" />
                <StatusBadge status={s} />
              </label>
            ))}
          </PopoverContent>
        </Popover>

        {/* Risk slider */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[--p2-gray-200] rounded-md bg-white hover:bg-[--p2-gray-50] text-[--p2-gray-600]">
              Risk: {riskRange[0]}–{riskRange[1]}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-4" align="start">
            <p className="text-xs font-medium text-[--p2-gray-600] mb-3">Risk Score Range</p>
            <Slider min={0} max={100} step={1} value={riskRange} onValueChange={(v) => { setRiskRange(v as [number, number]); setPage(0); }} className="mb-2" />
            <div className="flex justify-between text-[10px] text-[--p2-gray-400]">
              <span>{riskRange[0]}</span><span>{riskRange[1]}</span>
            </div>
          </PopoverContent>
        </Popover>

        {/* Nationality multi-select */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[--p2-gray-200] rounded-md bg-white hover:bg-[--p2-gray-50] text-[--p2-gray-600]">
              Nationality {selectedNats.length > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-[--p2-blue] text-white">{selectedNats.length}</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-2" align="start">
            <input value={natSearch} onChange={e => setNatSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1.5 mb-2 text-xs border border-[--p2-gray-200] rounded bg-white focus:outline-none"
            />
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {NATIONALITIES.filter(n => n.name.toLowerCase().includes(natSearch.toLowerCase())).map(n => (
                <label key={n.code} className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-[--p2-gray-50] rounded cursor-pointer">
                  <Checkbox checked={selectedNats.includes(n.code)} onCheckedChange={() => toggleNat(n.code)} className="h-3.5 w-3.5" />
                  <span>{FLAG[n.code]} {n.name}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Date range */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[--p2-gray-200] rounded-md bg-white hover:bg-[--p2-gray-50] text-[--p2-gray-600]">
              {dateFrom ? format(dateFrom, 'MMM d') : 'From'} — {dateTo ? format(dateTo, 'MMM d') : 'To'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="flex gap-4">
              <div>
                <p className="text-[10px] font-medium text-[--p2-gray-400] mb-1">FROM</p>
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} className="p-0 pointer-events-auto" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-[--p2-gray-400] mb-1">TO</p>
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} className="p-0 pointer-events-auto" />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs text-[--p2-red] hover:underline flex items-center gap-1">
            <X size={12} /> Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="p2-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[--p2-gray-200] bg-[--p2-gray-50]">
                <th className="px-3 py-3 w-10">
                  <Checkbox checked={paged.length > 0 && selected.size === paged.length} onCheckedChange={toggleAll} className="h-3.5 w-3.5" />
                </th>
                <th className="px-2 py-3 w-6" />
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[--p2-gray-500]">
                  <SortHeader label="Applicant" colKey="name" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[--p2-gray-500]">Nationality</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[--p2-gray-500]">
                  <SortHeader label="Risk" colKey="riskScore" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[--p2-gray-500]">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[--p2-gray-500]">
                  <SortHeader label="Submitted" colKey="hoursAgo" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[--p2-gray-500]">Assigned</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[--p2-gray-500]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(c => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/p2/dashboard/cases/${c.id}`)}
                  className={cn(
                    'border-b border-[--p2-gray-100] transition-colors hover:bg-[--p2-blue]/[0.03] cursor-pointer',
                    c.riskScore > 75 && 'border-l-[3px] border-l-[--p2-red]'
                  )}
                >
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    <Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggleSelect(c.id)} className="h-3.5 w-3.5" />
                  </td>
                  <td className="px-2 py-3">
                    {c.riskScore > 75 ? (
                      <span className="w-2 h-2 rounded-full bg-[--p2-red] inline-block p2-dot-pulse" />
                    ) : c.riskScore > 50 ? (
                      <span className="w-2 h-2 rounded-full bg-[--p2-orange] inline-block" />
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[--p2-navy]">{c.name}</p>
                    <p className="text-[11px] text-[--p2-gray-400]">{c.passport}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[--p2-gray-700]">
                    <span className="mr-1.5">{FLAG[c.nationalityCode]}</span>{c.nationality}
                  </td>
                  <td className="px-4 py-3"><ScoreCircle score={c.riskScore} size="sm" /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-xs text-[--p2-gray-500]">{c.submitted}</td>
                  <td className="px-4 py-3">
                    {c.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[--p2-navy] text-white text-[10px] font-bold flex items-center justify-center">{c.assignedAvatar}</span>
                        <span className="text-xs text-[--p2-gray-600]">{c.assignedTo}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[--p2-gray-400] italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded hover:bg-[--p2-gray-100] text-[--p2-gray-400] hover:text-[--p2-blue]" title="View"><Eye size={14} /></button>
                      <button className="p-1.5 rounded hover:bg-[--p2-gray-100] text-[--p2-gray-400] hover:text-[--p2-blue]" title="Assign"><UserPlus size={14} /></button>
                      <button className="p-1.5 rounded hover:bg-[--p2-gray-100] text-[--p2-gray-400] hover:text-[--p2-green]" title="Review"><CheckSquare size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
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

      {/* ── Bulk Actions Bar ── */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[--p2-navy] text-white rounded-xl px-6 py-3 flex items-center gap-4 shadow-2xl"
          >
            <span className="text-sm font-medium">{selected.size} case{selected.size > 1 ? 's' : ''} selected</span>
            <div className="w-px h-5 bg-white/20" />
            <Button size="sm" variant="secondary" className="text-xs h-8 bg-white/10 hover:bg-white/20 text-white border-0">
              <UserPlus size={13} className="mr-1" /> Assign to...
            </Button>
            <Button size="sm" variant="secondary" className="text-xs h-8 bg-white/10 hover:bg-white/20 text-white border-0">
              <Download size={13} className="mr-1" /> Export Selected
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
