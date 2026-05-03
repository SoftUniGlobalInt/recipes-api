import 'dotenv/config';
import postgres from 'postgres';

import { POST as loginHandler } from '@/app/api/auth/login/route';
import { GET as listHandler, POST as createHandler } from '@/app/api/recipes/route';
import {
  GET as getByIdHandler,
  PATCH as patchHandler,
  DELETE as deleteHandler,
} from '@/app/api/recipes/[id]/route';
import { GET as myRecipesHandler } from '@/app/api/recipes/my/route';

import { makeRequest, json } from './helpers';

const BASE = 'http://localhost';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Login and return the token for the given seeded user. */
async function loginAs(email: string, password = 'testpass123'): Promise<string> {
  const res = await loginHandler(
    makeRequest(`${BASE}/api/auth/login`, { method: 'POST', body: { email, password } })
  );
  const body = await json<any>(res);
  if (!body.data?.token) throw new Error(`Login failed for ${email}: ${JSON.stringify(body)}`);
  return body.data.token;
}

/** Call the single-recipe route handler with the correct params shape. */
function makeParams(id: number) {
  return { params: Promise.resolve({ id: String(id) }) };
}

// ── State shared across tests ─────────────────────────────────────────────────

let token1: string; // user1@test.com
let token2: string; // user2@test.com
let user1Id: number;
let user2Id: number;
let recipe1Id: number; // owned by user1
let recipe2Id: number; // owned by user1
let recipe3Id: number; // owned by user2

beforeAll(async () => {
  // Resolve IDs from the DB (seeded by globalSetup)
  const client = postgres(process.env.TEST_DATABASE_URL!);
  try {
    const users = await client`SELECT id, email FROM users WHERE email IN ('user1@test.com','user2@test.com') ORDER BY id`;
    user1Id = users.find((u: any) => u.email === 'user1@test.com')!.id;
    user2Id = users.find((u: any) => u.email === 'user2@test.com')!.id;

    const recipes = await client`SELECT id, user_id FROM recipes ORDER BY id`;
    const user1Recipes = recipes.filter((r: any) => r.user_id === user1Id);
    const user2Recipes = recipes.filter((r: any) => r.user_id === user2Id);
    recipe1Id = user1Recipes[0].id;
    recipe2Id = user1Recipes[1].id;
    recipe3Id = user2Recipes[0].id;
  } finally {
    await client.end();
  }

  // Obtain tokens by logging in (real bcrypt verify against the test DB)
  [token1, token2] = await Promise.all([loginAs('user1@test.com'), loginAs('user2@test.com')]);
});

// ── List recipes ──────────────────────────────────────────────────────────────

describe('GET /api/recipes', () => {
  it('returns a paginated list of recipes (no auth required)', async () => {
    const res = await listHandler(makeRequest(`${BASE}/api/recipes`));
    const body = await json<any>(res);

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.recipes)).toBe(true);
    expect(body.data.recipes.length).toBeGreaterThanOrEqual(3);
    expect(body.data).toHaveProperty('total');
    expect(body.data).toHaveProperty('totalPages');
  });

  it('filters by search term', async () => {
    const res = await listHandler(
      makeRequest(`${BASE}/api/recipes?search=User1+Recipe+A`)
    );
    const body = await json<any>(res);

    expect(res.status).toBe(200);
    const titles = body.data.recipes.map((r: any) => r.title);
    expect(titles).toContain('User1 Recipe A');
  });

  it('filters by tag', async () => {
    const res = await listHandler(makeRequest(`${BASE}/api/recipes?tag=snack`));
    const body = await json<any>(res);

    expect(res.status).toBe(200);
    expect(body.data.recipes.length).toBeGreaterThanOrEqual(1);
    body.data.recipes.forEach((r: any) => {
      expect(r.tags).toContain('snack');
    });
  });

  it('respects pageSize parameter', async () => {
    const res = await listHandler(makeRequest(`${BASE}/api/recipes?pageSize=2`));
    const body = await json<any>(res);

    expect(res.status).toBe(200);
    expect(body.data.recipes.length).toBeLessThanOrEqual(2);
  });
});

// ── View single recipe ────────────────────────────────────────────────────────

describe('GET /api/recipes/:id', () => {
  it('returns a single recipe (no auth required)', async () => {
    const res = await getByIdHandler(
      makeRequest(`${BASE}/api/recipes/${recipe1Id}`),
      makeParams(recipe1Id)
    );
    const body = await json<any>(res);

    expect(res.status).toBe(200);
    expect(body.data.id).toBe(recipe1Id);
    expect(body.data.title).toBe('User1 Recipe A');
  });

  it('returns 404 for a non-existent recipe', async () => {
    const res = await getByIdHandler(
      makeRequest(`${BASE}/api/recipes/999999`),
      makeParams(999999)
    );
    expect(res.status).toBe(404);
  });
});

// ── Create recipe ─────────────────────────────────────────────────────────────

describe('POST /api/recipes', () => {
  const newRecipe = {
    title: 'Integration Test Recipe',
    description: 'Created during testing',
    ingredients: 'water, flour',
    instructions: '1. Mix. 2. Cook.',
    cookingTime: 15,
    servings: 2,
    tags: 'test',
  };

  it('creates a recipe when authenticated', async () => {
    const res = await createHandler(
      makeRequest(`${BASE}/api/recipes`, { method: 'POST', body: newRecipe, token: token1 })
    );
    const body = await json<any>(res);

    expect(res.status).toBe(201);
    expect(body.data.title).toBe(newRecipe.title);
    expect(body.data.userId).toBe(user1Id);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await createHandler(
      makeRequest(`${BASE}/api/recipes`, { method: 'POST', body: newRecipe })
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await createHandler(
      makeRequest(`${BASE}/api/recipes`, {
        method: 'POST',
        body: { title: 'No ingredients or instructions' },
        token: token1,
      })
    );
    expect(res.status).toBe(400);
  });
});

// ── My recipes ────────────────────────────────────────────────────────────────

describe('GET /api/recipes/my', () => {
  it('returns only the authenticated user\'s recipes', async () => {
    const res = await myRecipesHandler(
      makeRequest(`${BASE}/api/recipes/my`, { token: token1 })
    );
    const body = await json<any>(res);

    expect(res.status).toBe(200);
    const userIds = body.data.recipes.map((r: any) => r.userId);
    userIds.forEach((id: number) => expect(id).toBe(user1Id));
  });

  it('returns 401 when not authenticated', async () => {
    const res = await myRecipesHandler(makeRequest(`${BASE}/api/recipes/my`));
    expect(res.status).toBe(401);
  });
});

// ── Edit recipe ───────────────────────────────────────────────────────────────

describe('PATCH /api/recipes/:id', () => {
  it('owner can edit their own recipe', async () => {
    const res = await patchHandler(
      makeRequest(`${BASE}/api/recipes/${recipe1Id}`, {
        method: 'PATCH',
        body: { title: 'Updated Title' },
        token: token1,
      }),
      makeParams(recipe1Id)
    );
    const body = await json<any>(res);

    expect(res.status).toBe(200);
    expect(body.data.title).toBe('Updated Title');
  });

  it('returns 403 when a different user tries to edit the recipe', async () => {
    const res = await patchHandler(
      makeRequest(`${BASE}/api/recipes/${recipe1Id}`, {
        method: 'PATCH',
        body: { title: 'Stolen Edit' },
        token: token2, // user2 does not own recipe1
      }),
      makeParams(recipe1Id)
    );
    expect(res.status).toBe(403);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await patchHandler(
      makeRequest(`${BASE}/api/recipes/${recipe1Id}`, {
        method: 'PATCH',
        body: { title: 'Anon Edit' },
      }),
      makeParams(recipe1Id)
    );
    expect(res.status).toBe(401);
  });

  it('returns 404 for a non-existent recipe', async () => {
    const res = await patchHandler(
      makeRequest(`${BASE}/api/recipes/999999`, {
        method: 'PATCH',
        body: { title: 'Ghost' },
        token: token1,
      }),
      makeParams(999999)
    );
    expect(res.status).toBe(404);
  });
});

// ── Delete recipe ─────────────────────────────────────────────────────────────

describe('DELETE /api/recipes/:id', () => {
  it('returns 403 when a different user tries to delete the recipe', async () => {
    const res = await deleteHandler(
      makeRequest(`${BASE}/api/recipes/${recipe2Id}`, {
        method: 'DELETE',
        token: token2, // user2 does not own recipe2
      }),
      makeParams(recipe2Id)
    );
    expect(res.status).toBe(403);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await deleteHandler(
      makeRequest(`${BASE}/api/recipes/${recipe2Id}`, { method: 'DELETE' }),
      makeParams(recipe2Id)
    );
    expect(res.status).toBe(401);
  });

  it('owner can delete their own recipe', async () => {
    const res = await deleteHandler(
      makeRequest(`${BASE}/api/recipes/${recipe2Id}`, {
        method: 'DELETE',
        token: token1,
      }),
      makeParams(recipe2Id)
    );
    expect(res.status).toBe(200);

    // Confirm it's gone
    const check = await getByIdHandler(
      makeRequest(`${BASE}/api/recipes/${recipe2Id}`),
      makeParams(recipe2Id)
    );
    expect(check.status).toBe(404);
  });

  it('returns 404 for a non-existent recipe', async () => {
    const res = await deleteHandler(
      makeRequest(`${BASE}/api/recipes/999999`, {
        method: 'DELETE',
        token: token1,
      }),
      makeParams(999999)
    );
    expect(res.status).toBe(404);
  });
});
