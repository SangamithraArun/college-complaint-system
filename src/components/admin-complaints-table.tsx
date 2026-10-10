"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { CATEGORIES, STATUSES } from "@/lib/constants";
import type { Complaint, ComplaintCategory, ComplaintStatus, Profile } from "@/lib/types";
import { formatDate, statusLabel } from "@/lib/utils";

type Row = Complaint & {
  student: Pick<Profile, "full_name"> | null;
};

export function AdminComplaintsTable({ complaints }: { complaints: Row[] }) {
  const [status, setStatus] = useState<ComplaintStatus | "all">("all");
  const [category, setCategory] = useState<ComplaintCategory | "all">("all");

  const filtered = useMemo(() => {
    return complaints.filter((complaint) => {
      const statusOk = status === "all" || complaint.status === status;
      const categoryOk = category === "all" || complaint.category === category;
      return statusOk && categoryOk;
    });
  }, [complaints, status, category]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value as ComplaintStatus | "all")}
        >
          <option value="all">All statuses</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {statusLabel(value)}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          value={category}
          onChange={(event) => setCategory(event.target.value as ComplaintCategory | "all")}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No complaints match these filters"
          description="Try another status or category, or wait for students to submit new reports."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((complaint) => (
                <tr key={complaint.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{complaint.title}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {complaint.student?.full_name || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{complaint.category}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(complaint.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/${complaint.id}`}
                      className="font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
