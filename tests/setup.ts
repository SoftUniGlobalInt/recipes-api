import { execSync } from 'child_process';
import path from 'path';

async function globalSetup() {
  // Run migrations on test database
  try {
    console.log('Running migrations on test database...');
    execSync('npm run migrate', {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
      stdio: 'inherit'
    });
    console.log('✓ Migrations completed');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }

  // Seed test data
  try {
    console.log('Seeding test data...');
    execSync('npm run test-seed', {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
      stdio: 'inherit'
    });
    console.log('✓ Test seeding completed');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}

export default globalSetup;