import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(data: T, statusCode = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status: statusCode });
}

export function errorResponse(error: string, statusCode = 400): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error }, { status: statusCode });
}

export function createdResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}

export function forbiddenResponse(): NextResponse<ApiResponse> {
  return NextResponse.json(
    { success: false, error: 'Forbidden' },
    { status: 403 }
  );
}

export function notFoundResponse(): NextResponse<ApiResponse> {
  return NextResponse.json(
    { success: false, error: 'Not found' },
    { status: 404 }
  );
}
