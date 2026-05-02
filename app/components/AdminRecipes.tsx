'use client';

import { useState, useEffect } from 'react';
import type { Recipe } from '@/app/types';
import { useAuth } from '@/app/providers/AuthProvider';

export default function AdminRecipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Recipe>>({});

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/recipes', {
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError('Failed to fetch recipes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingId(recipe.id);
    setEditFormData(recipe);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      const response = await fetch(`/api/admin/recipes/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(editFormData),
      });
      if (!response.ok) throw new Error('Failed to update recipe');
      await fetchRecipes();
      setEditingId(null);
      setEditFormData({});
    } catch (err) {
      setError('Failed to update recipe');
      console.error(err);
    }
  };

  const handleDelete = async (recipeId: number) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    try {
      const response = await fetch(`/api/admin/recipes/${recipeId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!response.ok) throw new Error('Failed to delete recipe');
      await fetchRecipes();
    } catch (err) {
      setError('Failed to delete recipe');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center text-slate-500">Loading recipes...</div>;
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {recipes.length === 0 ? (
          <p className="text-slate-500">No recipes found</p>
        ) : (
          recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="rounded-lg border border-slate-200 p-4 hover:shadow-md transition"
            >
              {editingId === recipe.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Title"
                    value={editFormData.title || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <textarea
                    placeholder="Description"
                    value={editFormData.description || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                  <textarea
                    placeholder="Ingredients"
                    value={editFormData.ingredients || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, ingredients: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                  <textarea
                    placeholder="Instructions"
                    value={editFormData.instructions || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, instructions: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="rounded-lg bg-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{recipe.title}</h3>
                      <p className="text-sm text-slate-600">
                        by {recipe.user?.name} ({recipe.user?.email})
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    {recipe.description}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(recipe)}
                      className="rounded-lg bg-indigo-100 px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      className="rounded-lg bg-red-100 px-3 py-1 text-sm text-red-600 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
