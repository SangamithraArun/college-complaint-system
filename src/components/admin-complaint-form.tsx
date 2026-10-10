"use client";

import { updateComplaint } from "@/app/actions/complaints";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { STATUSES } from "@/lib/constants";
import type { Complaint, ComplaintStatus, Profile } from "@/lib/types";
import { statusLabel } from "@/lib/utils";

const field =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-indigo-500 focus:ring-2";

export function AdminComplaintForm({
  complaint,
  admins,
}: {
  complaint: Complaint;
  admins: Pick<Profile, "id" | "full_name">[];
}) {
  const action = updateComplaint.bind(null, complaint.id);

  return (
    <ActionForm action={action} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Update assignment and status</h2>
      <label className="block text-sm font-medium text-slate-700">
        Assign to
        <select className={field} name="assigned_to" defaultValue={complaint.assigned_to ?? ""}>
          <option value="">Unassigned</option>
          {admins.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.full_name || admin.id}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Status
        <select className={field} name="status" defaultValue={complaint.status as ComplaintStatus}>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton>Save</SubmitButton>
    </ActionForm>
  );
}
