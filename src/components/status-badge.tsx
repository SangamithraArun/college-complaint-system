import type { ComplaintStatus } from "@/lib/types";
import { cn, statusLabel } from "@/lib/utils";

const STYLES: Record<ComplaintStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 ring-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 ring-blue-200",
  resolved: "bg-green-100 text-green-800 ring-green-200",
};

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        STYLES[status]
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
