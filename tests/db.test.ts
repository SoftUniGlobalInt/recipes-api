import 'dotenv/config';
import { db } from '@/db';

describe('DB Test', () => {
  it('should connect to DB', async () => {
    const users = await db.query.users.findMany();
    expect(users).toBeDefined();
  });
});