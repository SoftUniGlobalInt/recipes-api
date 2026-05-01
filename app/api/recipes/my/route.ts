import { NextRequest } from 'next/server';
import { db } from '@/db';
import { recipes, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth(request);

    if (!auth) {
      return unauthorizedResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));

    // Get total count
    const countResult = await db
      .select({ count: db.$count(recipes) })
      .from(recipes)
      .where(eq(recipes.userId, auth.userId));

    const total = countResult[0]?.count || 0;

    // Get paginated results
    const offset = (page - 1) * pageSize;
    const userRecipes = await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, auth.userId))
      .orderBy(recipes.dateCreated)
      .limit(pageSize)
      .offset(offset);

    return successResponse({
      recipes: userRecipes,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Get my recipes error:', error);
    return errorResponse('Failed to fetch recipes', 500);
  }
}
