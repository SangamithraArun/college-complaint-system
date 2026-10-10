import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { COMPLAINT_IMAGES_BUCKET } from "@/lib/constants";
import { requireRole } from "@/lib/auth";
import type { Complaint, ComplaintStatus, Profile } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function StudentComplaintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireRole("student");

  const { data: complaint } = await supabase
    .from("complaints")
    .select(
      "id, student_id, title, description, category, status, image_path, assigned_to, created_at, updated_at"
    )
    .eq("id", id)
    .eq("student_id", user.id)
    .maybeSingle();

  if (!complaint) {
    notFound();
  }

  const row = complaint as Complaint;
  let imageUrl: string | null = null;

  if (row.image_path) {
    const { data } = await supabase.storage
      .from(COMPLAINT_IMAGES_BUCKET)
      .createSignedUrl(row.image_path, 60);
    imageUrl = data?.signedUrl ?? null;
  }

  const { data: assignee } = row.assigned_to
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", row.assigned_to)
        .maybeSingle()
    : { data: null };

  const { data: history } = await supabase
    .from("status_history")
    .select("id, status, created_at, changer:profiles!status_history_changed_by_fkey(full_name)")
    .eq("complaint_id", row.id)
    .order("created_at", { ascending: false });

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
          Description
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-slate-800">{row.description}</p>
      </section>

      {imageUrl ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Signed URLs expire quickly; a native img tag is the right fit. */}
          {/* Signed URLs expire in 60s and are not a static remote host. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Complaint attachment" className="max-h-[32rem] w-full bg-slate-100 object-contain" />
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Assigned to
        </h2>
        <p className="mt-2 text-slate-900">
          {(assignee as Pick<Profile, "full_name"> | null)?.full_name || "Not assigned yet"}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Status timeline</h2>
        <StatusTimeline history={timeline} />
      </section>
    </div>
  );
}
