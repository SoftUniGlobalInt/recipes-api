'use client';

import { useAuth } from '@/app/providers/AuthProvider';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import AdminRecipes from '@/app/components/AdminRecipes';
import AdminUsers from '@/app/components/AdminUsers';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'recipes' | 'users'>('recipes');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Panel</h1>
          <p className="text-slate-600">Manage recipes and users</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'recipes'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Manage Recipes
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'users'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Manage Users
          </button>
        </div>

        {/* Tab Content */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          {activeTab === 'recipes' && <AdminRecipes />}
          {activeTab === 'users' && <AdminUsers />}
        </div>
      </div>
    </div>
  );
}
