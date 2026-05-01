import { comparePasswords, hashPassword } from '@/lib/auth';

describe('auth helpers', () => {
  it('hashes passwords and compares correctly', async () => {
    const plainPassword = 'securePassword123';
    const hashed = await hashPassword(plainPassword);

    expect(hashed).not.toBe(plainPassword);
    expect(await comparePasswords(plainPassword, hashed)).toBe(true);
    expect(await comparePasswords('wrongPassword', hashed)).toBe(false);
  });
});
