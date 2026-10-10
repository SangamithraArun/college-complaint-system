"use client";

import { useActionState, useEffect, useRef } from "react";
import { useToast } from "@/components/toast-provider";
import type { ActionResult } from "@/lib/types";

const initial: ActionResult = {};

export function ActionForm({
  action,
  className,
  children,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  className?: string;
  children: React.ReactNode;
}) {
  const { notify } = useToast();
  const [state, formAction] = useActionState(action, initial);
  const shown = useRef<ActionResult>({});

  useEffect(() => {
    if (state.error && state.error !== shown.current.error) {
      notify(state.error, "error");
      shown.current = state;
    }
    if (state.success && state.success !== shown.current.success) {
      notify(state.success, "success");
      shown.current = state;
    }
  }, [state, notify]);

  return (
    <form action={formAction} className={className}>
      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {state.success}
        </p>
      ) : null}
      {children}
    </form>
  );
}
