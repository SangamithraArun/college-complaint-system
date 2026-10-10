"use client";

import Link from "next/link";
import { signIn, signUp } from "@/app/actions/auth";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-indigo-500 focus:ring-2";

export function LoginForm() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to track and manage campus complaints."
      footer={
        <>
          Need an account?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </>
      }
    >
      <ActionForm action={signIn} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input className={inputClass} type="email" name="email" required autoComplete="email" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            className={inputClass}
            type="password"
            name="password"
            required
            autoComplete="current-password"
          />
        </label>
        <SubmitButton className="w-full">Log in</SubmitButton>
      </ActionForm>
    </AuthCard>
  );
}

export function SignupForm() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Students can submit and track complaints from one place."
      footer={
        <>
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </>
      }
    >
      <ActionForm action={signUp} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Full name
          <input className={inputClass} type="text" name="full_name" required autoComplete="name" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input className={inputClass} type="email" name="email" required autoComplete="email" />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            className={inputClass}
            type="password"
            name="password"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        <SubmitButton className="w-full">Sign up</SubmitButton>
      </ActionForm>
    </AuthCard>
  );
}

function AuthCard({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Campus Complaints
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {children}
      <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>
    </div>
  );
}
