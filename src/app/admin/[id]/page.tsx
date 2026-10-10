import { notFound } from "next/navigation";
import { AdminComplaintForm } from "@/components/admin-complaint-form";
import { StatusBadge } from "@/components/status-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { COMPLAINT_IMAGES_BUCKET } from "@/lib/constants";
import { requireRole } from "@/lib/auth";
import type { Complaint, ComplaintStatus, Profile } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function AdminComplaintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireRole("admin");

  const { data: complaint } = await supabase
    .from("complaints")
    .select(
      "id, student_id, title, description, category, status, image_path, assigned_to, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (!complaint) {
    notFound();
  }

  const row = complaint as Complaint;

  const [{ data: student }, { data: admins }, { data: history }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", row.student_id).maybeSingle(),
    supabase.from("profiles").select("id, full_name").eq("role", "admin").order("full_name"),
    supabase
      .from("status_history")
      .select("id, status, created_at, changer:profiles!status_history_changed_by_fkey(full_name)")
      .eq("complaint_id", row.id)
      .order("created_at", { ascending: false }),
  ]);

  let imageUrl: string | null = null;
  if (row.image_path) {
    const { data } = await supabase.storage
      .from(COMPLAINT_IMAGES_BUCKET)
      .createSignedUrl(row.image_path, 60);
    imageUrl = data?.signedUrl ?? null;
  }

  const timeline = (history ?? []).map((item) => {
    const changer = Array.isArray(item.changer) ? item.changer[0] : item.changer;
    return {
      id: item.id as string,
      status: item.status as ComplaintStatus,
      created_at: item.created_at as string,
      changer: (changer as Pick<Profile, "full_name"> | null) ?? null,
    };
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{row.category}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{row.title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Submitted {formatDate(row.created_at)}
            </p>
          </div>
          <StatusBadge status={row.status} />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Student
          </h2>
          <p className="mt-2 text-lg font-medium text-slate-900">
            {(student as Pick<Profile, "full_name"> | null)?.full_name || "Unknown student"}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Description
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-slate-800">{row.description}</p>
        </section>

        {imageUrl ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Complaint attachment" className="max-h-[32rem] w-full bg-slate-100 object-contain" />
          </section>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Status timeline</h2>
          <StatusTimeline history={timeline} />
        </section>
      </div>

      <AdminComplaintForm
        complaint={row}
        admins={(admins ?? []) as Pick<Profile, "id" | "full_name">[]}
      />
    </div>
  );
}
