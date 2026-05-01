import { NextRequest } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';
import { signToken } from '@/lib/jwt';
import { validateRegisterInput } from '@/lib/validation';
import {
  successResponse,
  createdResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    const validationError = validateRegisterInput(email, password, name);
    if (validationError) {
      return errorResponse(validationError, 400);
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return errorResponse('User with this email already exists', 400);
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const newUser = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
      })
      .returning({ id: users.id, email: users.email, name: users.name });

    // Create JWT token
    const token = signToken({
      userId: newUser[0].id,
      email: newUser[0].email,
    });

    // Create response with cookie
    const response = createdResponse({
      user: newUser[0],
      token,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse('Failed to register', 500);
  }
}
