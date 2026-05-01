jest.mock('@/db', () => {
  const findFirst = jest.fn();
  const insert = jest.fn();
  return {
    db: {
      query: {
        users: {
          findFirst,
        },
      },
      insert,
    },
  };
});

jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn(async () => 'hashed-password'),
  comparePasswords: jest.fn(async (password: string, hashedPassword: string) => password === 'correct-password' && hashedPassword === 'hashed-password'),
}));

jest.mock('@/lib/jwt', () => ({
  signToken: jest.fn(() => 'jwt-token'),
}));

import { db } from '@/db';
import { signToken } from '@/lib/jwt';
import { POST as registerPOST } from '@/app/api/auth/register/route';
import { POST as loginPOST } from '@/app/api/auth/login/route';

describe('auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when register input is missing required fields', async () => {
    const request = {
      json: async () => ({ email: '', password: '', name: '' }),
    } as any;
    const response = await registerPOST(request);

    expect(response.status).toBe(400);
  });

  it('creates a user and returns 201 for valid register input', async () => {
    const findFirstMock = db.query.users.findFirst as jest.Mock;
    const insertMock = db.insert as jest.Mock;

    findFirstMock.mockResolvedValue(null);
    insertMock.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 1, email: 'test@example.com', name: 'Test User' }]),
      }),
    });

    const request = {
      json: async () => ({ email: 'test@example.com', password: 'password123', name: 'Test User' }),
    } as any;

    const response = await registerPOST(request);

    expect(response.status).toBe(201);
    expect(signToken).toHaveBeenCalledWith({ userId: 1, email: 'test@example.com' });
  });

  it('returns 401 when login credentials are invalid', async () => {
    const findFirstMock = db.query.users.findFirst as jest.Mock;
    findFirstMock.mockResolvedValue(null);

    const request = {
      json: async () => ({ email: 'test@example.com', password: 'password123' }),
    } as any;

    const response = await loginPOST(request);
    expect(response.status).toBe(401);
  });
});
