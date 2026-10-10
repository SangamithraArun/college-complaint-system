import { StatusBadge } from "@/components/status-badge";
import type { ComplaintStatus, Profile } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type HistoryRow = {
  id: string;
  status: ComplaintStatus;
  created_at: string;
  changer: Pick<Profile, "full_name"> | null;
};

export function StatusTimeline({ history }: { history: HistoryRow[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-slate-500">No status updates yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {history.map((item, index) => (
        <li key={item.id} className="relative flex gap-4 pl-2">
          <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={item.status} />
              {index === 0 ? (
                <span className="text-xs font-medium text-slate-400">Latest</span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {item.changer?.full_name || "System"} · {formatDate(item.created_at)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
