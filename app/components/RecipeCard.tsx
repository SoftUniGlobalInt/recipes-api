import Link from 'next/link';
import type { Recipe } from '@/app/types';

interface RecipeCardProps {
  recipe: Recipe;
  showActions?: boolean;
  onDelete?: () => void;
  isOwner?: boolean;
}

export default function RecipeCard({ recipe, showActions, onDelete, isOwner }: RecipeCardProps) {
  const tags = recipe.tags ? recipe.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [];
  const maybeDate = recipe.dateCreated ? new Date(recipe.dateCreated).toLocaleDateString() : null;

  return (
    <article className="rounded-3xl border border-violet-100 bg-white p-6 shadow-[0_25px_70px_-45px_rgba(99,102,241,0.35)] transition hover:shadow-[0_35px_90px_-55px_rgba(99,102,241,0.35)]">
      {recipe.photoUrl ? (
        <img
          src={recipe.photoUrl}
          alt={`Cover for ${recipe.title}`}
          className="mb-5 h-48 w-full rounded-3xl object-cover"
          loading="lazy"
        />
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href={`/recipes/${recipe.id}`}>
            <h2 className="text-xl font-semibold text-slate-900 transition hover:text-accent-dark">
              {recipe.title}
            </h2>
          </Link>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {recipe.description || 'No description provided.'}
          </p>
        </div>
        <div className="text-right text-xs text-slate-500">
          {maybeDate}
          <div>{recipe.user?.name || `User ${recipe.userId}`}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href={`/recipes/${recipe.id}`}
          className="text-sm font-semibold text-indigo-700 transition hover:text-indigo-900"
        >
          View details
        </Link>
        {showActions && isOwner ? (
          <>
            <Link
              href={`/recipes/${recipe.id}/edit`}
              className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 transition hover:bg-red-100"
            >
              Delete
            </button>
          </>
        ) : null}
      </div>
    </article>
  );
}
