import { NextRequest } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyAuth } from '@/lib/auth-middleware';
import { successResponse, unauthorizedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAuth(request);

    if (!auth) {
      return unauthorizedResponse();
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, auth.userId),
    });

    if (!user) {
      return unauthorizedResponse();
    }

    return successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return unauthorizedResponse();
  }
}
