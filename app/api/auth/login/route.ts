import { NextRequest } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { comparePasswords } from '@/lib/auth';
import { signToken } from '@/lib/jwt';
import { isValidEmail } from '@/lib/validation';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    if (!isValidEmail(email)) {
      return errorResponse('Email must be valid', 400);
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Verify password
    const passwordMatch = await comparePasswords(password, user.password);

    if (!passwordMatch) {
      return errorResponse('Invalid email or password', 401);
    }

    // Create JWT token
    const token = signToken({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    // Create response with cookie
    const response = successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
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
    console.error('Login error:', error);
    return errorResponse('Failed to login', 500);
  }
}
