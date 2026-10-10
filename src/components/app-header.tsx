import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import type { Profile } from "@/lib/types";

export function AppHeader({
  profile,
  links,
}: {
  profile: Profile;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href={profile.role === "admin" ? "/admin" : "/student"} className="text-lg font-bold text-slate-900">
            Campus Complaints
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-indigo-600">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{profile.full_name || "User"}</p>
            <p className="text-xs capitalize text-slate-500">{profile.role}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
