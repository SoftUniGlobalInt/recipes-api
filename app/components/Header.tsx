'use client';

import Link from 'next/link';
import { useAuth } from '@/app/providers/AuthProvider';

export default function Header() {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-surface bg-gradient-to-r from-indigo-50 via-surface to-rose-50 backdrop-blur-lg shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-semibold text-accent-dark">
            Recipes
          </Link>
          <Link
            href="/api-docs"
            className="text-sm font-medium text-slate-600 transition hover:text-accent-dark"
          >
            API Docs
          </Link>
          <Link
            href="/recipes/new"
            className="rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-3 py-1 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
          >
            New Recipe
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {loading ? (
            <span className="text-sm text-slate-500">Checking auth…</span>
          ) : user ? (
            <>
              <span className="text-sm text-slate-700">Hi, {user.name}</span>
              <Link
                href="/my-recipes"
                className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-sm font-medium text-white transition hover:brightness-110"
              >
                My Recipes
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-surface bg-surface px-3 py-1 text-sm text-slate-700 transition hover:bg-surface-muted"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full border border-surface bg-surface px-3 py-1 text-sm text-slate-700 transition hover:bg-surface-muted"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-sm font-medium text-white transition hover:brightness-110"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
