describe('JWT token helpers', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1h';
  });

  it('signs and verifies a token payload successfully', async () => {
    const { signToken, verifyToken } = await import('@/lib/jwt');
    const token = signToken({ userId: 5, email: 'test@example.com' });

    expect(typeof token).toBe('string');

    const payload = verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload).toMatchObject({ userId: 5, email: 'test@example.com' });
  });

  it('returns null for an invalid token', async () => {
    const { verifyToken } = await import('@/lib/jwt');
    expect(verifyToken('not-a-valid-token')).toBeNull();
  });
});
