import type { CATEGORIES, STATUSES } from "@/lib/constants";

export type UserRole = "student" | "admin";
export type ComplaintCategory = (typeof CATEGORIES)[number];
export type ComplaintStatus = (typeof STATUSES)[number];

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
};

export type Complaint = {
  id: string;
  student_id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  image_path: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

export type StatusHistory = {
  id: string;
  complaint_id: string;
  status: ComplaintStatus;
  changed_by: string;
  created_at: string;
};

export type ActionResult = {
  error?: string;
  success?: string;
};
