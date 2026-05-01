import { NextResponse } from 'next/server';
import { successResponse } from '@/lib/api-response';

export async function POST() {
  const response = successResponse({ message: 'Logged out successfully' });

  response.cookies.delete('auth_token');

  return response;
}
