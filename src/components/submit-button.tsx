"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
    >
      {pending ? <Spinner /> : null}
      {pending ? "Please wait..." : children}
    </button>
  );
}
