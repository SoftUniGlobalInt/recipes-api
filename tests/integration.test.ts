import { execSync } from 'child_process';
import path from 'path';
import { POST as loginPOST } from '@/app/api/auth/login/route';
import { GET as meGET } from '@/app/api/auth/me/route';
import { POST as logoutPOST } from '@/app/api/auth/logout/route';
import { GET as recipesGET, POST as recipesPOST } from '@/app/api/recipes/route';
import { GET as recipeGET, PUT as recipePUT, DELETE as recipeDELETE } from '@/app/api/recipes/[id]/route';
import { GET as myRecipesGET } from '@/app/api/recipes/my/route';
import 'dotenv/config';

// Helper to create mock requests and responses
async function testHandler(handler: any, url: string, method: string, body?: any, headers?: Record<string, string>, params?: Record<string, string>) {
  const mockRequest = {
    url,
    method,
    json: async () => body || {},
    headers: new Map(Object.entries(headers || {})),
    nextUrl: new URL(url, 'http://localhost:3000'),
  };

  if (params) {
    (mockRequest as any).params = Promise.resolve(params);
  }

  try {
    const response = await handler(mockRequest, params ? { params: Promise.resolve(params) } : undefined);
    const responseBody = await response.json().catch(() => null);
    return {
      status: response.status,
      body: responseBody,
    };
  } catch (error) {
    console.error('Handler error:', error);
    throw error;
  }
}

describe('Recipes API Integration Tests', () => {
  let user1Token: string;
  let user2Token: string;
  let recipe1Id: number;
  let recipe2Id: number;
  let recipe3Id: number;

  beforeAll(async () => {
    // Run migrations and seed
    try {
      console.log('Running migrations...');
      execSync('npm run migrate', {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
        stdio: 'inherit'
      });
      console.log('Migrations completed');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }

    try {
      console.log('Seeding test data...');
      execSync('npm run test-seed', {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
        stdio: 'inherit'
      });
      console.log('Seeding completed');
    } catch (error) {
      console.error('Seeding failed:', error);
      throw error;
    }

    // The test users are already created by the seed script
    // Just login with existing users
    const login1 = await testHandler(loginPOST, 'http://localhost:3000/api/auth/login', 'POST', {
      email: 'testuser1@example.com',
      password: 'testpass123'
    });

    expect(login1.status).toBe(200);
    user1Token = login1.body.token;

    const login2 = await testHandler(loginPOST, 'http://localhost:3000/api/auth/login', 'POST', {
      email: 'testuser2@example.com',
      password: 'testpass123'
    });

    expect(login2.status).toBe(200);
    user2Token = login2.body.token;

    // Get existing recipes from seed
    const recipes = await testHandler(recipesGET, 'http://localhost:3000/api/recipes', 'GET', null, {
      authorization: `Bearer ${user1Token}`
    });

    expect(recipes.status).toBe(200);
    const recipeList = recipes.body;
    recipe1Id = recipeList.find((r: any) => r.title === 'Test Recipe 1').id;
    recipe2Id = recipeList.find((r: any) => r.title === 'Test Recipe 2').id;
    recipe3Id = recipeList.find((r: any) => r.title === 'Test Recipe 3').id;
  }, 60000); // Increase timeout

  describe('Authentication Flow', () => {
    it('should register a new user', async () => {
      const response = await testHandler(registerPOST, 'http://localhost:3000/api/auth/register', 'POST', {
        email: 'newuser@example.com',
        password: 'newpass123',
        name: 'New User'
      });

      console.log('Register response:', response.status, response.body);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('newuser@example.com');
    });

    it('should login existing user', async () => {
      const response = await testHandler(loginPOST, 'http://localhost:3000/api/auth/login', 'POST', {
        email: 'testuser1@example.com',
        password: 'testpass123'
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('testuser1@example.com');
    });

    it('should return user info for /me endpoint', async () => {
      const response = await testHandler(meGET, 'http://localhost:3000/api/auth/me', 'GET', null, {
        authorization: `Bearer ${user1Token}`
      });

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('testuser1@example.com');
      expect(response.body.name).toBe('Test User 1');
    });

    it('should logout user', async () => {
      const response = await testHandler(logoutPOST, 'http://localhost:3000/api/auth/logout', 'POST', null, {
        authorization: `Bearer ${user1Token}`
      });

      expect(response.status).toBe(200);
    });
  });

  describe('Recipes CRUD Operations', () => {
    it('should list all recipes', async () => {
      const response = await testHandler(recipesGET, 'http://localhost:3000/api/recipes', 'GET', null, {
        authorization: `Bearer ${user1Token}`
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get a specific recipe', async () => {
      const response = await testHandler(recipeGET, 'http://localhost:3000/api/recipes/1', 'GET', null, {
        authorization: `Bearer ${user1Token}`
      }, { id: recipe1Id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Test Recipe 1');
      expect(response.body.userId).toBeDefined();
    });

    it('should create a new recipe', async () => {
      const newRecipe = {
        title: 'New Test Recipe',
        description: 'Created during integration test',
        ingredients: 'test ingredient 1, test ingredient 2',
        instructions: '1. Mix ingredients. 2. Cook thoroughly.',
        cookingTime: 25,
        servings: 3,
        tags: 'integration,test'
      };

      const response = await testHandler(recipesPOST, 'http://localhost:3000/api/recipes', 'POST', newRecipe, {
        authorization: `Bearer ${user1Token}`
      });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(newRecipe.title);
      expect(response.body.userId).toBeDefined();
    });

    it('should update own recipe', async () => {
      const updateData = {
        title: 'Updated Test Recipe 1',
        description: 'Updated description'
      };

      const response = await testHandler(recipePUT, 'http://localhost:3000/api/recipes/1', 'PUT', updateData, {
        authorization: `Bearer ${user1Token}`
      }, { id: recipe1Id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should delete own recipe', async () => {
      const response = await testHandler(recipeDELETE, 'http://localhost:3000/api/recipes/1', 'DELETE', null, {
        authorization: `Bearer ${user1Token}`
      }, { id: recipe2Id.toString() });

      expect(response.status).toBe(200);

      // Verify it's deleted
      const getResponse = await testHandler(recipeGET, 'http://localhost:3000/api/recipes/1', 'GET', null, {
        authorization: `Bearer ${user1Token}`
      }, { id: recipe2Id.toString() });

      expect(getResponse.status).toBe(404);
    });
  });

  describe('Access Control', () => {
    it('should not allow editing another user\'s recipe', async () => {
      const updateData = {
        title: 'Hacked Title'
      };

      const response = await testHandler(recipePUT, 'http://localhost:3000/api/recipes/1', 'PUT', updateData, {
        authorization: `Bearer ${user1Token}`
      }, { id: recipe3Id.toString() });

      expect(response.status).toBe(403);
    });

    it('should not allow deleting another user\'s recipe', async () => {
      const response = await testHandler(recipeDELETE, 'http://localhost:3000/api/recipes/1', 'DELETE', null, {
        authorization: `Bearer ${user1Token}`
      }, { id: recipe3Id.toString() });

      expect(response.status).toBe(403);
    });

    it('should not allow anonymous user to create recipe', async () => {
      const newRecipe = {
        title: 'Anonymous Recipe',
        ingredients: 'ingredients',
        instructions: 'instructions'
      };

      const response = await testHandler(recipesPOST, 'http://localhost:3000/api/recipes', 'POST', newRecipe);

      expect(response.status).toBe(401);
    });

    it('should not allow anonymous user to update recipe', async () => {
      const updateData = { title: 'Anonymous Update' };

      const response = await testHandler(recipePUT, 'http://localhost:3000/api/recipes/1', 'PUT', updateData, {}, { id: recipe1Id.toString() });

      expect(response.status).toBe(401);
    });

    it('should not allow anonymous user to delete recipe', async () => {
      const response = await testHandler(recipeDELETE, 'http://localhost:3000/api/recipes/1', 'DELETE', null, {}, { id: recipe1Id.toString() });

      expect(response.status).toBe(401);
    });
  });

  describe('User Recipes', () => {
    it('should list user\'s own recipes', async () => {
      const response = await testHandler(myRecipesGET, 'http://localhost:3000/api/recipes/my', 'GET', null, {
        authorization: `Bearer ${user1Token}`
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // Should include the updated recipe1 and exclude deleted recipe2
      const titles = response.body.map((r: any) => r.title);
      expect(titles).toContain('Updated Test Recipe 1');
      expect(titles).not.toContain('Test Recipe 2');
    });
  });
});