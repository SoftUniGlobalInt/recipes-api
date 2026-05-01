'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import RecipeCard from './components/RecipeCard';
import Pagination from './components/Pagination';
import { useAuth } from './providers/AuthProvider';
import type { Recipe, PaginatedRecipes } from './types';

export default function Home() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [tagQuery, setTagQuery] = useState('');
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: '8',
      });

      if (search) params.set('search', search);
      if (tag) params.set('tag', tag);

      const response = await fetch(`/api/recipes?${params.toString()}`, {
        cache: 'no-store',
      });
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        setError(payload?.error || 'Unable to load recipes.');
        setRecipes([]);
      } else {
        const data = payload.data as PaginatedRecipes;
        setRecipes(data.recipes);
        setTotalPages(data.totalPages);
      }
    } catch {
      setError('Unable to load recipes.');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [page, search, tag]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(query.trim());
    setTag(tagQuery.trim());
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl border border-surface bg-gradient-to-br from-indigo-50 via-surface to-rose-50 p-8 shadow-[0_25px_80px_-60px_rgba(99,102,241,0.45)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Browse recipes</h1>
              <p className="mt-2 text-slate-600">Discover recipes from the public collection, search by keyword, and filter by tags.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/api-docs" className="rounded-full border border-surface bg-surface px-4 py-2 text-sm text-slate-700 transition hover:bg-surface-muted">
                API docs
              </Link>
              {user ? (
                <Link href="/my-recipes" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                  My Recipes
                </Link>
              ) : (
                <Link href="/auth/login" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Login / Register
                </Link>
              )}
            </div>
          </div>

          <form onSubmit={handleSearch} className="mt-8 grid gap-4 sm:grid-cols-[1.4fr_1fr_auto]">
            <label className="block">
              <span className="sr-only">Search</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search recipes by title, description, or ingredients"
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              />
            </label>
            <label className="block">
              <span className="sr-only">Tag</span>
              <input
                value={tagQuery}
                onChange={(event) => setTagQuery(event.target.value)}
                placeholder="Filter by tag"
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
            >
              Search
            </button>
          </form>
        </section>

        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
        ) : null}

        {loading ? (
          <div className="rounded-3xl border border-surface bg-surface p-8 shadow-sm text-slate-700">Loading recipes…</div>
        ) : recipes.length === 0 ? (
          <div className="rounded-3xl border border-surface bg-surface p-8 shadow-sm text-slate-700">
            <h2 className="text-xl font-semibold text-slate-900">No recipes found</h2>
            <p className="mt-2 text-slate-600">Try a different search term or tag.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={(nextPage) => setPage(nextPage)} />
      </div>
    </main>
  );
}
