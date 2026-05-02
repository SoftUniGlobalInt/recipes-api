import 'dotenv/config';
import postgres from 'postgres';
import bcryptjs from 'bcryptjs';

async function testSeed() {
  const connectionString = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('TEST_DATABASE_URL or DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const client = postgres(connectionString);

  try {
    console.log('Starting test seed...');

    // Truncate all tables to empty the database
    await client`TRUNCATE TABLE recipes, users RESTART IDENTITY CASCADE`;

    console.log('✓ Emptied database tables');

    // Hash passwords for test users
    const testPassword = await bcryptjs.hash('testpass123', 10);

    // Insert test users
    const usersResult = await client`
      INSERT INTO users (email, password, name) VALUES
      ('testuser1@example.com', ${testPassword}, 'Test User 1'),
      ('testuser2@example.com', ${testPassword}, 'Test User 2')
      RETURNING id, email, name
    `;

    console.log('✓ Created test users');

    // Insert test recipes
    const recipes = [
      {
        userId: usersResult[0].id,
        title: 'Test Recipe 1',
        description: 'A test recipe for integration testing',
        ingredients: 'ingredient1, ingredient2',
        instructions: '1. Step one. 2. Step two.',
        cookingTime: 30,
        servings: 4,
        tags: 'test,dinner',
      },
      {
        userId: usersResult[0].id,
        title: 'Test Recipe 2',
        description: 'Another test recipe',
        ingredients: 'ingredient3, ingredient4',
        instructions: '1. Mix. 2. Cook.',
        cookingTime: 15,
        servings: 2,
        tags: 'test,lunch',
      },
      {
        userId: usersResult[1].id,
        title: 'Test Recipe 3',
        description: 'Recipe by user 2',
        ingredients: 'ingredient5',
        instructions: '1. Prepare. 2. Serve.',
        cookingTime: 10,
        servings: 1,
        tags: 'test,snack',
      },
    ];

    for (const recipe of recipes) {
      await client`
        INSERT INTO recipes (title, description, ingredients, instructions, cooking_time, servings, tags, user_id)
        VALUES (${recipe.title}, ${recipe.description}, ${recipe.ingredients}, ${recipe.instructions}, ${recipe.cookingTime}, ${recipe.servings}, ${recipe.tags}, ${recipe.userId})
      `;
    }

    console.log('✓ Created test recipes');

    console.log('\n✓ Test seed completed successfully');
    console.log('Test users: testuser1@example.com, testuser2@example.com (password: testpass123)');
  } catch (error) {
    console.error('Test seed failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testSeed();