import { FileText, Trash2 } from 'lucide-react';
import type { ActivityEntry } from '@/lib/services/activity.service';

const ACTION_STYLE: Record<ActivityEntry['action'], { label: string; cls: string }> = {
  create: { label: 'Created', cls: 'bg-green-100 text-green-700' },
  update: { label: 'Updated', cls: 'bg-amber-100 text-amber-700' },
  delete: { label: 'Deleted', cls: 'bg-red-100 text-red-600' },
  note: { label: 'Evidence', cls: 'bg-blue-100 text-blue-700' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB');
}

interface Props {
  entries: ActivityEntry[];
  onDelete?: (id: string) => void;
}

export default function ActivityFeed({ entries, onDelete }: Props) {
  if (entries.length === 0) {
    return <p className="text-sm text-on-surface-variant text-center py-10">No activity recorded yet</p>;
  }

  return (
    <ul className="divide-y divide-outline-variant/40 text-sm">
      {entries.map((entry) => {
        const style = ACTION_STYLE[entry.action] ?? ACTION_STYLE.note;
        return (
          <li key={entry.id} className="py-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${style.cls}`}>{style.label}</span>
                <span className="font-medium text-on-surface truncate">{entry.summary}</span>
              </div>
              {entry.note && <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{entry.note}</p>}
              <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-1">
                <span>{entry.user?.fullName ?? 'You'}</span>
                <span>&middot;</span>
                <span>{timeAgo(entry.createdAt)}</span>
                {entry.fileUrl && (
                  <>
                    <span>&middot;</span>
                    <a
                      href={entry.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-umu-red hover:underline"
                    >
                      <FileText className="w-3 h-3" />
                      {entry.fileName ?? 'evidence file'}
                    </a>
                  </>
                )}
              </div>
            </div>
            {onDelete && (
              <button
                onClick={() => onDelete(entry.id)}
                className="text-on-surface-variant hover:text-red-500 transition-colors shrink-0"
                title="Remove entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}