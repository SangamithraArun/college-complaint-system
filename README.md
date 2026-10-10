# College Complaint Management System

A campus complaint portal for students and administrators. Students submit and track complaints; admins assign staff, update status, and review history.

**Stack:** Next.js App Router (TypeScript), Tailwind CSS, Supabase (Auth, Postgres, Storage) via `@supabase/ssr`, server actions, Vercel-ready.

## 1. Create a Supabase project

1. Open [Supabase](https://supabase.com) and create a new project.
2. Wait until the database is ready.
3. In **Project Settings → API**, copy:
   - Project URL
   - `anon` `public` API key

## 2. Run the database migration

1. Open the Supabase dashboard **SQL Editor**.
2. Paste the contents of [`supabase/migration.sql`](./supabase/migration.sql).
3. Run the script.

This creates `profiles`, `complaints`, and `status_history`; signup and `updated_at` triggers; `is_admin()`; RLS policies; the private `complaint-images` storage bucket; and storage policies.

## 3. Set environment variables

Copy the example file and fill in your project values:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. Sign up as a student (`/signup`).
2. Promote at least one user to admin (SQL below).
3. Log in: students land on `/student`, admins on `/admin`.

Route protection lives in `src/proxy.ts` (the Next.js 16 equivalent of middleware). Students can only use `/student/*`; admins can only use `/admin/*`.

If email confirmation is enabled in Supabase Auth, confirm the account before logging in. For local testing you can disable **Confirm email** under **Authentication → Providers → Email**.

## 5. Promote a user to admin

After the user has signed up, copy their UUID from **Authentication → Users** (or from `profiles.id`) and run:

```sql
update profiles set role='admin' where id = '<user-uuid>';
```

## 6. Deploy to Vercel

1. Push this repository to GitHub (or import the folder in Vercel).
2. Create a Vercel project from the repo.
3. Add the same environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. In Supabase **Authentication → URL Configuration**, add your Vercel URL to **Site URL** and **Redirect URLs**.

## Roles and features

| Role | Routes | Capabilities |
| --- | --- | --- |
| Student | `/student`, `/student/new`, `/student/[id]` | Create complaints (optional JPG/PNG/WebP image, max 5 MB), list own complaints, view detail, signed image URL, assignment, and status timeline |
| Admin | `/admin`, `/admin/[id]` | Stats, filter all complaints, assign an admin, change status, write status history |

Images are stored privately at `{user_id}/{uuid}.{ext}` in the `complaint-images` bucket. Detail pages request a signed URL that expires after 60 seconds.
