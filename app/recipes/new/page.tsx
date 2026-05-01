'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import RecipeForm, { type RecipeFormValues } from '@/app/components/RecipeForm';

export default function NewRecipePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: RecipeFormValues) => {
    setError(null);
    setSubmitting(true);

    const response = await fetch('/api/recipes', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: values.title,
        description: values.description,
        ingredients: values.ingredients,
        instructions: values.instructions,
        cookingTime: values.cookingTime ? parseInt(values.cookingTime, 10) : null,
        servings: values.servings ? parseInt(values.servings, 10) : null,
        tags: values.tags,
      }),
    });

    const payload = await response.json();

    if (!response.ok || !payload?.success) {
      setError(payload?.error || 'Could not create recipe');
      setSubmitting(false);
      return { success: false, message: payload?.error || 'Could not create recipe' };
    }

    const recipeId = payload.data.id;

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
        setError(photoPayload?.error || 'Could not upload cover image');
        setSubmitting(false);
        return { success: false, message: photoPayload?.error || 'Could not upload cover image' };
      }
    }

    setSubmitting(false);
    router.push(`/recipes/${recipeId}`);
    return { success: true };
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-700">Checking your session…</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Sign in to add recipes</h1>
          <p className="mt-3 text-slate-600">Log in or register to publish your own recipe content.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Add a new recipe</h1>
          <p className="mt-2 text-slate-600">Add the details and publish it to the recipe list.</p>
        </div>

        {error ? <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div> : null}

        <RecipeForm submitLabel={submitting ? 'Saving…' : 'Create recipe'} onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
