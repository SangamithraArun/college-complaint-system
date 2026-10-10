import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

export async function getSessionProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    profile: profile as Profile | null,
  };
}

export async function requireRole(role: UserRole) {
  const session = await getSessionProfile();

  if (!session.user || !session.profile) {
    redirect("/login");
  }

  if (session.profile.role !== role) {
    redirect(session.profile.role === "admin" ? "/admin" : "/student");
  }

  return {
    supabase: session.supabase,
    user: session.user,
    profile: session.profile,
  };
}
