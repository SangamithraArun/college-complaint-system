import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole("admin");

  return (
    <div className="min-h-full">
      <AppHeader profile={profile} links={[{ href: "/admin", label: "Dashboard" }]} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
