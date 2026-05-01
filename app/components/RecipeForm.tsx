'use client';

import { useEffect, useState, type FormEvent } from 'react';

export interface RecipeFormValues {
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  cookingTime: string;
  servings: string;
  tags: string;
  photoFile?: File | null;
  removePhoto?: boolean;
  photoUrl?: string;
}

interface RecipeFormProps {
  initialValues?: Partial<RecipeFormValues>;
  submitLabel: string;
  onSubmit: (values: RecipeFormValues) => Promise<{ success: boolean; message?: string }>;
}

export default function RecipeForm({
  initialValues = {},
  submitLabel,
  onSubmit,
}: RecipeFormProps) {
  const [values, setValues] = useState<RecipeFormValues>({
    title: initialValues.title || '',
    description: initialValues.description || '',
    ingredients: initialValues.ingredients || '',
    instructions: initialValues.instructions || '',
    cookingTime: initialValues.cookingTime || '',
    servings: initialValues.servings || '',
    tags: initialValues.tags || '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(initialValues.photoFile || null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(initialValues.photoUrl || '');
  const [removePhoto, setRemovePhoto] = useState(initialValues.removePhoto || false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const handleChange = (field: keyof RecipeFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0] ?? null;
    if (!file) {
      setPhotoFile(null);
      setPhotoPreviewUrl('');
      setRemovePhoto(true);
      return;
    }

    if (photoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreviewUrl);
    }

    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
    setRemovePhoto(false);
  };

  const handleRemovePhoto = () => {
    if (photoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreviewUrl);
    }

    setPhotoFile(null);
    setPhotoPreviewUrl('');
    setRemovePhoto(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await onSubmit({
      ...values,
      photoFile,
      removePhoto,
      photoUrl: photoPreviewUrl || undefined,
    });

    if (!result.success) {
      setError(result.message || 'Something went wrong.');
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <label className="block space-y-2 text-sm text-slate-700">
        <span className="font-medium">Cover image</span>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="w-full cursor-pointer rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
        />
      </label>

      {photoPreviewUrl ? (
        <div className="relative rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <img
            src={photoPreviewUrl}
            alt="Cover preview"
            className="mx-auto h-56 w-full max-w-full rounded-3xl object-cover"
          />
          <button
            type="button"
            onClick={handleRemovePhoto}
            className="mt-3 inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 transition hover:bg-red-100"
          >
            Remove image
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Optional: upload a cover image for the recipe.</p>
      )}

      <label className="block space-y-2 text-sm text-slate-700">
        <span className="font-medium">Title</span>
        <input
          value={values.title}
          onChange={(event) => handleChange('title', event.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          required
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-700">
        <span className="font-medium">Description</span>
        <textarea
          value={values.description}
          onChange={(event) => handleChange('description', event.target.value)}
          className="min-h-[100px] w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-700">
        <span className="font-medium">Ingredients</span>
        <textarea
          value={values.ingredients}
          onChange={(event) => handleChange('ingredients', event.target.value)}
          className="min-h-[100px] w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          required
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-700">
        <span className="font-medium">Instructions</span>
        <textarea
          value={values.instructions}
          onChange={(event) => handleChange('instructions', event.target.value)}
          className="min-h-[120px] w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          required
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2 text-sm text-slate-700">
          <span className="font-medium">Cooking time</span>
          <input
            type="number"
            value={values.cookingTime}
            onChange={(event) => handleChange('cookingTime', event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
            placeholder="Minutes"
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-700">
          <span className="font-medium">Servings</span>
          <input
            type="number"
            value={values.servings}
            onChange={(event) => handleChange('servings', event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
            placeholder="Number"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm text-slate-700">
        <span className="font-medium">Tags</span>
        <input
          value={values.tags}
          onChange={(event) => handleChange('tags', event.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          placeholder="e.g. vegan, comfort food"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  );
}
