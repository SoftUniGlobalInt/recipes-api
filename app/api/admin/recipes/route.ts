import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verifyAuth } from '@/lib/auth-middleware';

// Admin can view all recipes
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const allRecipes = await db.query.recipes.findMany({
      with: {
        user: {
          columns: { id: true, email: true, name: true },
        },
      },
    });

    return NextResponse.json(allRecipes);
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}
