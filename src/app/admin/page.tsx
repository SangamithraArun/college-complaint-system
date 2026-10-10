import { AdminComplaintsTable } from "@/components/admin-complaints-table";
import { requireRole } from "@/lib/auth";
import type { Complaint, Profile } from "@/lib/types";

export default async function AdminHomePage() {
  const { supabase } = await requireRole("admin");
  const { data, error } = await supabase
    .from("complaints")
    .select(
      "id, student_id, title, description, category, status, image_path, assigned_to, created_at, updated_at, student:profiles!complaints_student_id_fkey(full_name)"
    )
    .order("created_at", { ascending: false });

  const complaints = (data ?? []).map((row) => {
    const student = Array.isArray(row.student) ? row.student[0] : row.student;
    return {
      ...(row as unknown as Complaint),
      student: (student as Pick<Profile, "full_name"> | null) ?? null,
    };
  });

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "pending").length;
  const inProgress = complaints.filter((c) => c.status === "in_progress").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;

  const stats = [
    { label: "Total", value: total, className: "bg-white" },
    { label: "Pending", value: pending, className: "bg-yellow-50" },
    { label: "In Progress", value: inProgress, className: "bg-blue-50" },
    { label: "Resolved", value: resolved, className: "bg-green-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review campus complaints, assign staff, and update status.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border border-slate-200 p-5 shadow-sm ${stat.className}`}
          >
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error.message}
        </p>
      ) : null}

      <AdminComplaintsTable complaints={complaints} />
    </div>
  );
}
