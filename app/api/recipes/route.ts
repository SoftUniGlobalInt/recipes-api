import { NextRequest } from 'next/server';
import { db } from '@/db';
import { recipes, users } from '@/db/schema';
import { like, eq, and, sql, or } from 'drizzle-orm';
import {
  successResponse,
  errorResponse,
  createdResponse,
  unauthorizedResponse,
} from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth-middleware';
import { validateRecipeInput } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    // Build where conditions
    let whereCondition: any = undefined;

    if (tag && search) {
      whereCondition = and(
        like(recipes.tags, `%${tag}%`),
        or(
          like(recipes.title, `%${search}%`),
          like(recipes.description, `%${search}%`),
          like(recipes.ingredients, `%${search}%`)
        )
      );
    } else if (tag) {
      whereCondition = like(recipes.tags, `%${tag}%`);
    } else if (search) {
      whereCondition = or(
        like(recipes.title, `%${search}%`),
        like(recipes.description, `%${search}%`),
        like(recipes.ingredients, `%${search}%`)
      );
    }

    // Get total count
    let countQuery: any = db.select({ count: sql`count(*)::int` }).from(recipes);
    if (whereCondition) {
      countQuery = countQuery.where(whereCondition);
    }

    const countResult = await countQuery;
    const total = countResult[0]?.count || 0;

    // Get paginated results
    const offset = (page - 1) * pageSize;
    let dataQuery: any = db
      .select()
      .from(recipes)
      .leftJoin(users, eq(recipes.userId, users.id));

    if (whereCondition) {
      dataQuery = dataQuery.where(whereCondition);
    }

    const data = await dataQuery
      .orderBy(sql`${recipes.dateCreated} DESC`)
      .limit(pageSize)
      .offset(offset);

    const formattedRecipes = (data as any[]).map((row: any) => ({
      id: row.recipes.id,
      title: row.recipes.title,
      description: row.recipes.description,
      ingredients: row.recipes.ingredients,
      instructions: row.recipes.instructions,
      cookingTime: row.recipes.cookingTime,
      servings: row.recipes.servings,
      tags: row.recipes.tags,
      photoUrl: row.recipes.photoUrl,
      dateCreated: row.recipes.dateCreated,
      userId: row.recipes.userId,
      user: row.users
        ? {
            id: row.users.id,
            name: row.users.name,
            email: row.users.email,
          }
        : null,
    }));

    return successResponse({
      recipes: formattedRecipes,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    return errorResponse('Failed to fetch recipes', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = verifyAuth(request);

    if (!auth) {
      return unauthorizedResponse();
    }

    const {
      title,
      description,
      ingredients,
      instructions,
      cookingTime,
      servings,
      tags,
    } = await request.json();

    const validationError = validateRecipeInput({
      title,
      ingredients,
      instructions,
    }, true);

    if (validationError) {
      return errorResponse(validationError, 400);
    }

    const newRecipe = await db
      .insert(recipes)
      .values({
        title,
        description,
        ingredients,
        instructions,
        cookingTime,
        servings,
        tags,
        userId: auth.userId,
      })
      .returning();

    return createdResponse(newRecipe[0]);
  } catch (error) {
    console.error('Create recipe error:', error);
    return errorResponse('Failed to create recipe', 500);
  }
}
