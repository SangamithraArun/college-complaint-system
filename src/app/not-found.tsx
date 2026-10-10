import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">
        The page you requested does not exist or you do not have access.
      </p>
      <Link href="/" className="mt-6 font-semibold text-indigo-600 hover:text-indigo-500">
        Go home
      </Link>
    </main>
  );
}
