import 'dotenv/config';
import { GET as meHandler } from '@/app/api/auth/me/route';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { POST as registerHandler } from '@/app/api/auth/register/route';
import { makeRequest, json } from './helpers';

const BASE = 'http://localhost';

describe('Auth API', () => {
  // ── Register ──────────────────────────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    it('registers a new user and returns 201 with token', async () => {
      const req = makeRequest(`${BASE}/api/auth/register`, {
        method: 'POST',
        body: {
          email: 'newuser@test.com',
          password: 'password123',
          name: 'New User',
        },
      });

      const res = await registerHandler(req);
      const body = await json<any>(res);

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe('newuser@test.com');
      expect(body.data.token).toBeTruthy();
    });

    it('returns 400 when email is missing', async () => {
      const req = makeRequest(`${BASE}/api/auth/register`, {
        method: 'POST',
        body: { password: 'password123', name: 'No Email' },
      });

      const res = await registerHandler(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 when password is too short', async () => {
      const req = makeRequest(`${BASE}/api/auth/register`, {
        method: 'POST',
        body: { email: 'short@test.com', password: '123', name: 'Short' },
      });

      const res = await registerHandler(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 when email already exists', async () => {
      const req = makeRequest(`${BASE}/api/auth/register`, {
        method: 'POST',
        body: {
          email: 'user1@test.com', // seeded in globalSetup
          password: 'password123',
          name: 'Duplicate',
        },
      });

      const res = await registerHandler(req);
      const body = await json<any>(res);

      expect(res.status).toBe(400);
      expect(body.error).toMatch(/already exists/i);
    });
  });

  // ── Login ─────────────────────────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    it('logs in with correct credentials and returns token', async () => {
      const req = makeRequest(`${BASE}/api/auth/login`, {
        method: 'POST',
        body: { email: 'user1@test.com', password: 'testpass123' },
      });

      const res = await loginHandler(req);
      const body = await json<any>(res);

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.token).toBeTruthy();
      expect(body.data.user.email).toBe('user1@test.com');
    });

    it('returns 401 with wrong password', async () => {
      const req = makeRequest(`${BASE}/api/auth/login`, {
        method: 'POST',
        body: { email: 'user1@test.com', password: 'wrongpassword' },
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(401);
    });

    it('returns 401 with non-existent email', async () => {
      const req = makeRequest(`${BASE}/api/auth/login`, {
        method: 'POST',
        body: { email: 'nobody@test.com', password: 'testpass123' },
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(401);
    });

    it('returns 400 when email is missing', async () => {
      const req = makeRequest(`${BASE}/api/auth/login`, {
        method: 'POST',
        body: { password: 'testpass123' },
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(400);
    });
  });

  // ── Me ────────────────────────────────────────────────────────────────────

  describe('GET /api/auth/me', () => {
    it('returns the current user when authenticated', async () => {
      // Login to obtain a token with the real DB user id
      const loginReq = makeRequest(`${BASE}/api/auth/login`, {
        method: 'POST',
        body: { email: 'user1@test.com', password: 'testpass123' },
      });
      const loginRes = await loginHandler(loginReq);
      const { data } = await json<any>(loginRes);

      const req = makeRequest(`${BASE}/api/auth/me`, { token: data.token });
      const res = await meHandler(req);
      const body = await json<any>(res);

      expect(res.status).toBe(200);
      expect(body.data.email).toBe('user1@test.com');
      expect(body.data).not.toHaveProperty('password');
    });

    it('returns 401 when no token is provided', async () => {
      const req = makeRequest(`${BASE}/api/auth/me`);
      const res = await meHandler(req);
      expect(res.status).toBe(401);
    });

    it('returns 401 when token is invalid', async () => {
      const req = makeRequest(`${BASE}/api/auth/me`, {
        token: 'not.a.valid.token',
      });
      const res = await meHandler(req);
      expect(res.status).toBe(401);
    });
  });
});
