import { NewComplaintForm } from "@/components/new-complaint-form";

export default function NewComplaintPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Submit a complaint</h1>
        <p className="mt-1 text-sm text-slate-500">
          Include enough detail for staff to investigate and resolve the issue.
        </p>
      </div>
      <NewComplaintForm />
    </div>
  );
}
