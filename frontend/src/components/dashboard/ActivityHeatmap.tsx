import { useMemo, useState } from 'react';

const WEEKDAYS = ['Mon', 'Wed', 'Fri'];

function levelFor(count: number): string {
  if (count <= 0) return 'bg-neutral-100';
  if (count <= 2) return 'bg-red-200';
  if (count <= 5) return 'bg-red-300';
  if (count <= 9) return 'bg-red-400';
  return 'bg-umu-red';
}

interface Props {
  daily: { date: string; count: number }[];
}

export default function ActivityHeatmap({ daily }: Props) {
  const [hovered, setHovered] = useState<{ date: string; count: number } | null>(null);

  const byDate = useMemo(() => {
    const map = new Map<string, number>();
    daily.forEach((d) => map.set(d.date, d.count));
    return map;
  }, [daily]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - (15 * 7 - 1));

  const weeks = useMemo(() => {
    const cols: { date: Date; count: number }[][] = [];
    for (let w = 0; w < 16; w++) {
      const col: { date: Date; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const dt = new Date(start);
        dt.setDate(start.getDate() + w * 7 + d);
        const key = dt.toISOString().slice(0, 10);
        col.push({ date: dt, count: byDate.get(key) ?? 0 });
      }
      cols.push(col);
    }
    return cols;
  }, [start, byDate]);

  const monthLabels = useMemo(() => {
    const labels: { index: number; label: string }[] = [];
    let prev = '';
    weeks.forEach((col, i) => {
      const label = col[0].date.toLocaleDateString('en-GB', { month: 'short' });
      if (label !== prev) {
        labels.push({ index: i, label });
        prev = label;
      }
    });
    return labels;
  }, [weeks]);

  const total = useMemo(
    () => weeks.slice(0, 16).reduce((acc, col) => acc + col.reduce((a, c) => a + c.count, 0), 0),
    [weeks]
  );
  const priorWeek = useMemo(
    () => weeks.slice(0, 12).reduce((acc, col) => acc + col.reduce((a, c) => a + c.count, 0), 0),
    [weeks]
  );
  const lastWeek = useMemo(
    () => weeks.slice(12).reduce((acc, col) => acc + col.reduce((a, c) => a + c.count, 0), 0),
    [weeks]
  );
  const trend = priorWeek === 0 ? (lastWeek > 0 ? 100 : 0) : Math.round(((lastWeek - priorWeek) / priorWeek) * 100);

  return (
    <div className="rounded-m3-xl border border-outline-variant/60 bg-white shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-on-surface">Contribution Tracker</h3>
          <p className="text-[13px] text-on-surface-variant mt-0.5">What you've done across the system — every action counts.</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-umu-red">{total.toLocaleString()}</p>
          <p className="text-[11px] text-on-surface-variant">total actions</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex text-[10px] text-on-surface-variant mb-1">
          {monthLabels.map((m) => (
            <span key={m.label} style={{ marginLeft: m.index * 16 }}>{m.label}</span>
          ))}
        </div>
        <div className="flex">
          <div className="w-8 flex flex-col justify-between text-[10px] text-on-surface-variant pr-1">
            {WEEKDAYS.map((d) => (
              <span key={d} style={{ lineHeight: '13px' }}>{d}</span>
            ))}
            <span style={{ lineHeight: '13px' }}>&nbsp;</span>
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((col, w) => (
              <div key={w} className="flex flex-col gap-[3px]">
                {col.map((cell, d) => (
                  <div
                    key={`${w}-${d}`}
                    onMouseEnter={() => setHovered({ date: cell.date.toDateString(), count: cell.count })}
                    onMouseLeave={() => setHovered(null)}
                    className={`w-[13px] h-[13px] rounded-[3px] ${levelFor(cell.count)}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-on-surface-variant">
          <span>{hovered ? `${hovered.date}: ${hovered.count} action${hovered.count === 1 ? '' : 's'}` : 'Hover a day for details'}</span>
          <div className="flex items-center gap-1">
            <span>Less</span>
            {[0, 1, 3, 6, 10].map((level) => (
              <span key={level} className={`w-[11px] h-[11px] rounded-[3px] ${levelFor(level)}`} />
            ))}
            <span>More</span>
          </div>
        </div>
        {trend !== 0 && (
          <p className="mt-1 text-[11px] text-on-surface-variant">
            Last 4 weeks vs previous 12: <span className={trend > 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>{trend > 0 ? '+' : ''}{trend}%</span>
          </p>
        )}
      </div>
    </div>
  );
}