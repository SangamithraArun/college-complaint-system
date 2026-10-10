import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { requireRole } from "@/lib/auth";
import type { Complaint } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function StudentHomePage() {
  const { supabase, user } = await requireRole("student");
  const { data, error } = await supabase
    .from("complaints")
    .select(
      "id, student_id, title, description, category, status, image_path, assigned_to, created_at, updated_at"
    )
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  const complaints = (data ?? []) as Complaint[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Complaints</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track every report you have submitted.
          </p>
        </div>
        <Link
          href="/student/new"
          className="inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          New complaint
        </Link>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error.message}
        </p>
      ) : null}

      {complaints.length === 0 ? (
        <EmptyState
          title="No complaints yet"
          description="When something on campus needs attention, submit a complaint and follow its status here."
        />
      ) : (
        <ul className="grid gap-4">
          {complaints.map((complaint) => (
            <li key={complaint.id}>
              <Link
                href={`/student/${complaint.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {complaint.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {complaint.category} · {formatDate(complaint.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
