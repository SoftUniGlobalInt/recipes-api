import type { Config } from 'drizzle-kit';
import 'dotenv/config';

const config = {
  schema: './db/schema.ts',
  out: './db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} as unknown as Config;

export default config;
