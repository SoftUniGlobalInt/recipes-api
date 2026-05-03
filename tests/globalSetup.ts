import 'dotenv/config';
import postgres from 'postgres';
import bcryptjs from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';

export default async function globalSetup() {
  const connectionString = process.env.TEST_DATABASE_URL;

  if (!connectionString) {
    throw new Error('TEST_DATABASE_URL is not set');
  }

  const client = postgres(connectionString);

  try {
    // Run all migrations
    const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter((f) => f.endsWith('.sql')).sort();

    for (const file of sqlFiles) {
      const content = await fs.readFile(path.join(migrationsDir, file), 'utf-8');
      await client.unsafe(content);
    }

    // Empty all tables
    await client`TRUNCATE TABLE recipes, users RESTART IDENTITY CASCADE`;

    // Seed two test users
    const hash = await bcryptjs.hash('testpass123', 10);

    await client`
      INSERT INTO users (email, password, name) VALUES
      ('user1@test.com', ${hash}, 'Test User One'),
      ('user2@test.com', ${hash}, 'Test User Two')
    `;

    const dbUsers = await client`SELECT id FROM users ORDER BY id`;
    const user1Id = dbUsers[0].id;
    const user2Id = dbUsers[1].id;

    // Seed recipes: 2 for user1, 1 for user2
    await client`
      INSERT INTO recipes (title, description, ingredients, instructions, cooking_time, servings, tags, user_id) VALUES
      ('User1 Recipe A', 'Desc A', 'ing1, ing2', '1. Do this.', 20, 2, 'dinner,test', ${user1Id}),
      ('User1 Recipe B', 'Desc B', 'ing3, ing4', '1. Do that.', 10, 1, 'lunch,test', ${user1Id}),
      ('User2 Recipe C', 'Desc C', 'ing5',       '1. Serve.',   5,  1, 'snack,test', ${user2Id})
    `;
  } finally {
    await client.end();
  }
}
