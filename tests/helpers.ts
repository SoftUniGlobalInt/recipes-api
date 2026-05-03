import { NextRequest } from 'next/server';
import { signToken } from '@/lib/jwt';

/**
 * Build a NextRequest suitable for calling route handlers directly.
 */
export function makeRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string;
    cookie?: string;
  } = {}
): NextRequest {
  const { method = 'GET', body, token, cookie } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (cookie) {
    headers['Cookie'] = cookie;
  }

  return new NextRequest(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * Sign a JWT for a test user.
 */
export function makeToken(id: number, email: string, isAdmin = false): string {
  return signToken({ id, email, isAdmin });
}

/**
 * Parse JSON body from a NextResponse (or any Response).
 */
export async function json<T = unknown>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}
