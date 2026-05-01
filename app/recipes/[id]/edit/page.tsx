'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import RecipeForm, { type RecipeFormValues } from '@/app/components/RecipeForm';
import type { Recipe } from '@/app/types';

export default function EditRecipePage() {
  const params = useParams();
  const recipeId = typeof params?.id === 'string' ? params.id : null;
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
          setError(payload?.error || 'Unable to load recipe');
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

  if (loading || loadingRecipe) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-700">Loading recipe…</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Sign in to edit recipes</h1>
          <p className="mt-3 text-slate-600">Log in first, then return to manage your recipe.</p>
        </div>
      </main>
    );
  }

  if (!recipe) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <p className="text-slate-700">{error || 'Recipe not found.'}</p>
        </div>
      </main>
    );
  }

  const isOwner = user.id === recipe.userId;

  if (!isOwner) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Access denied</h1>
          <p className="mt-3 text-slate-600">You can only edit recipes you created.</p>
        </div>
      </main>
    );
  }

  const handleSubmit = async (values: RecipeFormValues) => {
    setError(null);
    setSubmitting(true);

    if (!recipeId) {
      setError('Invalid recipe ID');
      setSubmitting(false);
      return { success: false, message: 'Invalid recipe ID' };
    }

    const patchBody: any = {
      title: values.title,
      description: values.description,
      ingredients: values.ingredients,
      instructions: values.instructions,
      cookingTime: values.cookingTime ? parseInt(values.cookingTime, 10) : null,
      servings: values.servings ? parseInt(values.servings, 10) : null,
      tags: values.tags,
    };

    if (values.removePhoto) {
      patchBody.photoUrl = null;
    }

    const response = await fetch(`/api/recipes/${recipeId}`, {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchBody),
    });

    const payload = await response.json();

    if (!response.ok || !payload?.success) {
      setSubmitting(false);
      setError(payload?.error || 'Could not update recipe');
      return { success: false, message: payload?.error || 'Could not update recipe' };
    }

    if (values.photoFile) {
      const photoForm = new FormData();
      photoForm.append('photo', values.photoFile);

      const photoResponse = await fetch(`/api/recipes/${recipeId}/photo`, {
        method: 'POST',
        credentials: 'same-origin',
        body: photoForm,
      });

      const photoPayload = await photoResponse.json();
      if (!photoResponse.ok || !photoPayload?.success) {
        setSubmitting(false);
        setError(photoPayload?.error || 'Could not upload cover image');
        return { success: false, message: photoPayload?.error || 'Could not upload cover image' };
      }
    }

    setSubmitting(false);
    router.push(`/recipes/${params.id}`);
    return { success: true };
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Edit recipe</h1>
          <p className="mt-2 text-slate-600">Update the recipe details and save your changes.</p>
        </div>

        {error ? <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div> : null}

        <RecipeForm
          submitLabel={submitting ? 'Saving…' : 'Save changes'}
          initialValues={{
            title: recipe.title,
            description: recipe.description || '',
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            cookingTime: recipe.cookingTime ? String(recipe.cookingTime) : '',
            servings: recipe.servings ? String(recipe.servings) : '',
            tags: recipe.tags || '',
            photoUrl: recipe.photoUrl || '',
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}
