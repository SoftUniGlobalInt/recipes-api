'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/providers/AuthProvider';
import RecipeCard from '@/app/components/RecipeCard';
import type { Recipe, PaginatedRecipes } from '@/app/types';

export default function MyRecipesPage() {
  const { user, loading } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async () => {
    setLoadingRecipes(true);
    setError(null);

    try {
      const response = await fetch(`/api/recipes/my?page=${page}&pageSize=8`, {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        setError(payload?.error || 'Unable to load recipes');
        setRecipes([]);
      } else {
        const data = payload.data as PaginatedRecipes;
        setRecipes(data.recipes);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      setError('Unable to load recipes');
      setRecipes([]);
    } finally {
      setLoadingRecipes(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecipes();
    }
  }, [user, page]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-700">Checking your session…</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <h1 className="text-2xl font-semibold text-slate-900">My recipes</h1>
          <p className="mt-3 text-slate-600">You need to sign in to view and manage your recipes.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/auth/login" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Login
            </Link>
            <Link href="/auth/register" className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700">
              Register
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">My recipes</h1>
              <p className="mt-2 text-slate-600">Manage the recipes you created.</p>
            </div>
            <Link
              href="/recipes/new"
              className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add a recipe
            </Link>
          </div>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
        ) : null}

        {loadingRecipes ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">Loading recipes…</div>
        ) : recipes.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-slate-700">
            <p className="text-lg font-medium">No recipes found.</p>
            <p className="mt-2 text-slate-600">Start by creating your first recipe.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                showActions
                isOwner={true}
                onDelete={async () => {
                  const confirmed = window.confirm('Delete this recipe?');
                  if (!confirmed) return;

                  await fetch(`/api/recipes/${recipe.id}`, {
                    method: 'DELETE',
                    credentials: 'same-origin',
                  });
                  fetchRecipes();
                }}
              />
            ))}
          </div>
        )}

        {recipes.length > 0 ? (
          <div className="flex justify-center">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="mx-4 text-sm text-slate-600">Page {page}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
