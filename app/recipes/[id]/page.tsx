'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import type { Recipe } from '@/app/types';

export default function RecipeDetailPage() {
  const params = useParams();
  const recipeId = typeof params?.id === 'string' ? params.id : null;
  const { user, loading } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!recipeId) {
        setError('Invalid recipe ID');
        setLoadingRecipe(false);
        return;
      }

      setLoadingRecipe(true);
      setError(null);

      try {
        const response = await fetch(`/api/recipes/${recipeId}`, {
          cache: 'no-store',
          credentials: 'same-origin',
        });
        const payload = await response.json();

        if (!response.ok || !payload?.success) {
          setError(payload?.error || 'Recipe not found');
          setRecipe(null);
        } else {
          setRecipe(payload.data as Recipe);
        }
      } catch {
        setError('Unable to load recipe');
      } finally {
        setLoadingRecipe(false);
      }
    };

    fetchRecipe();
  }, [params.id]);

  if (loadingRecipe) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-700">Loading recipe details…</p>
        </div>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <p className="text-slate-700">{error || 'Recipe not found.'}</p>
          <Link href="/" className="mt-6 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Back to recipes
          </Link>
        </div>
      </main>
    );
  }

  const isOwner = !loading && user?.id === recipe.userId;
  const tags = recipe.tags?.split(',').map((tag) => tag.trim()).filter(Boolean) ?? [];

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">{recipe.title}</h1>
              <p className="mt-3 text-slate-600">Created by user {recipe.userId}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                Back to browse
              </Link>
              {isOwner ? (
                <Link
                  href={`/recipes/${recipe.id}/edit`}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Edit recipe
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          {recipe.photoUrl ? (
            <img
              src={recipe.photoUrl}
              alt={`Cover for ${recipe.title}`}
              className="mx-auto h-80 w-full rounded-[2rem] object-cover"
              loading="lazy"
            />
          ) : null}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
            <p className="text-slate-600">{recipe.description || 'No description available.'}</p>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Cooking time</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{recipe.cookingTime ? `${recipe.cookingTime} min` : 'Not specified'}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Servings</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{recipe.servings ?? 'Not specified'}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Ingredients</h3>
              <p className="mt-3 whitespace-pre-line text-slate-700">{recipe.ingredients}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Instructions</h3>
              <p className="mt-3 whitespace-pre-line text-slate-700">{recipe.instructions}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
