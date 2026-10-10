import { Spinner } from "@/components/spinner";

export function PageLoading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-16 text-slate-500">
      <Spinner className="h-5 w-5" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
