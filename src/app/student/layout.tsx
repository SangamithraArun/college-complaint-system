import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole("student");

  return (
    <div className="min-h-full">
      <AppHeader
        profile={profile}
        links={[
          { href: "/student", label: "My Complaints" },
          { href: "/student/new", label: "New complaint" },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
