"use client";

import { useState } from "react";
import { createComplaint } from "@/app/actions/complaints";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { useToast } from "@/components/toast-provider";
import { CATEGORIES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";
import { validateComplaintImage } from "@/lib/utils";

const field =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-indigo-500 focus:ring-2";

export function NewComplaintForm() {
  const { notify } = useToast();
  const [fileError, setFileError] = useState<string | null>(null);

  return (
    <ActionForm action={createComplaint} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <label className="block text-sm font-medium text-slate-700">
        Title
        <input className={field} name="title" required maxLength={120} placeholder="Short summary of the issue" />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Category
        <select className={field} name="category" required defaultValue="">
          <option value="" disabled>
            Select a category
          </option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Description
        <textarea
          className={`${field} min-h-36`}
          name="description"
          required
          placeholder="Describe what happened, where, and when."
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Image (optional)
        <input
          className={`${field} file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-indigo-700`}
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) {
              setFileError(null);
              return;
            }
            const error = validateComplaintImage(file);
            setFileError(error);
            if (error) {
              notify(error, "error");
              event.target.value = "";
            }
          }}
        />
        <span className="mt-1 block text-xs text-slate-500">
          JPG, PNG, or WebP. Max {MAX_IMAGE_SIZE_BYTES / (1024 * 1024)} MB.
        </span>
        {fileError ? <span className="mt-1 block text-sm text-red-600">{fileError}</span> : null}
      </label>
      <SubmitButton>Submit complaint</SubmitButton>
    </ActionForm>
  );
}
