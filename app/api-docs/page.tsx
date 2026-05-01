import Link from 'next/link';

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Recipes API Documentation</h1>
              <p className="mt-2 text-slate-600">
                Use these endpoints to browse public recipes, authenticate users, and manage recipe content.
              </p>
            </div>
            <Link
              href="/"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to app
            </Link>
          </div>

          <div className="mt-8 space-y-8">
            <section className="space-y-4 rounded-3xl bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-900">Authentication Endpoints</h2>
              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <p className="font-semibold text-slate-900">POST /api/auth/register</p>
                  <p>Register a new user account.</p>
                  <code className="mt-2 block rounded-2xl bg-white p-3 text-sm text-slate-800">Body: {'{email, password, name}'}</code>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">POST /api/auth/login</p>
                  <p>Login with existing credentials.</p>
                  <code className="mt-2 block rounded-2xl bg-white p-3 text-sm text-slate-800">Body: {'{email, password}'}</code>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">POST /api/auth/logout</p>
                  <p>Logout the current user.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">GET /api/auth/me</p>
                  <p>Get the current authenticated user.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-3xl bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-900">Recipe Endpoints</h2>
              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <p className="font-semibold text-slate-900">GET /api/recipes</p>
                  <p>List recipes with optional pagination, search, and tag filtering.</p>
                  <code className="mt-2 block rounded-2xl bg-white p-3 text-sm text-slate-800">
                    Query: ?page=1&pageSize=10&tag=vegan&search=pasta
                  </code>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">POST /api/recipes</p>
                  <p>Create a new recipe (authentication required).</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">GET /api/recipes/my</p>
                  <p>List recipes created by the authenticated user.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">GET /api/recipes/:id</p>
                  <p>Fetch recipe details by ID.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">PATCH /api/recipes/:id</p>
                  <p>Update a recipe owned by the authenticated user.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">POST /api/recipes/:id/photo</p>
                  <p>Upload or replace a recipe cover image using Cloudflare R2.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">DELETE /api/recipes/:id</p>
                  <p>Delete a recipe owned by the authenticated user.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
