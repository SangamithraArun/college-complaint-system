"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CATEGORIES,
  COMPLAINT_IMAGES_BUCKET,
  STATUSES,
} from "@/lib/constants";
import { requireRole } from "@/lib/auth";
import type { ActionResult, ComplaintCategory, ComplaintStatus } from "@/lib/types";
import { fileExtension, validateComplaintImage } from "@/lib/utils";

export async function createComplaint(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, user } = await requireRole("student");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "") as ComplaintCategory;
  const image = formData.get("image");

  if (!title) return { error: "Title is required." };
  if (!description) return { error: "Description is required." };
  if (!CATEGORIES.includes(category)) {
    return { error: "Choose a valid category." };
  }

  let imagePath: string | null = null;

  if (image instanceof File && image.size > 0) {
    const validationError = validateComplaintImage(image);
    if (validationError) return { error: validationError };

    const ext = fileExtension(image);
    if (!ext) return { error: "Image must be JPG, PNG, or WebP." };

    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(COMPLAINT_IMAGES_BUCKET)
      .upload(path, image, {
        contentType: image.type || `image/${ext === "jpg" ? "jpeg" : ext}`,
        upsert: false,
      });

    if (uploadError) return { error: uploadError.message };
    imagePath = path;
  }

  const { data, error } = await supabase
    .from("complaints")
    .insert({
      student_id: user.id,
      title,
      description,
      category,
      image_path: imagePath,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  if (!data) return { error: "Could not create the complaint." };

  revalidatePath("/student");
  redirect(`/student/${data.id}`);
}

export async function updateComplaint(
  complaintId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, user } = await requireRole("admin");

  const status = String(formData.get("status") ?? "") as ComplaintStatus;
  const assignedRaw = String(formData.get("assigned_to") ?? "");
  const assignedTo = assignedRaw.length > 0 ? assignedRaw : null;

  if (!STATUSES.includes(status)) {
    return { error: "Choose a valid status." };
  }

  const { error: updateError } = await supabase
    .from("complaints")
    .update({
      status,
      assigned_to: assignedTo,
    })
    .eq("id", complaintId);

  if (updateError) return { error: updateError.message };

  const { error: historyError } = await supabase.from("status_history").insert({
    complaint_id: complaintId,
    status,
    changed_by: user.id,
  });

  if (historyError) return { error: historyError.message };

  revalidatePath("/admin");
  revalidatePath(`/admin/${complaintId}`);
  revalidatePath(`/student/${complaintId}`);
  return { success: "Complaint updated." };
}
