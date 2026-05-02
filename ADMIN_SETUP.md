# Admin Panel Setup Guide

## Overview

The Recipes API now includes an admin panel for managing all recipes and users in the system. Admin users have elevated privileges and can:

- View and manage all recipes (edit/delete any recipe)
- View and manage all users (edit/delete users, promote to admin)

## Promoting Your First Admin User

The first admin user must be promoted manually via SQL in your Neon database. Follow these steps:

### Step 1: Get User ID
First, find the ID of the user you want to promote. You can query this from Neon console or API:

```sql
SELECT id, email, name, is_admin FROM users WHERE email = 'your-email@example.com';
```

For testing, the seed script creates these users:
- `alice@example.com` (ID: 1)
- `bob@example.com` (ID: 2)
- `charlie@example.com` (ID: 3)

### Step 2: Promote User to Admin

Run this SQL command in your Neon database to promote a user to admin:

```sql
UPDATE users SET is_admin = true WHERE id = 1;
```

Replace `1` with the actual user ID.

### Step 3: Verify Promotion

```sql
SELECT id, email, name, is_admin FROM users WHERE id = 1;
```

### Step 4: Login and Access Admin Panel

1. Login to the app with the admin user credentials
2. After login, you should see an **[Admin Panel]** link in the header
3. Click it to access the admin interface

## Admin Panel Features

### Manage Recipes Tab
- View all recipes from all users
- Search and filter recipes
- Edit recipe details (title, description, ingredients, instructions, etc.)
- Delete recipes
- See which user created each recipe

### Manage Users Tab
- View all registered users
- Edit user information (name)
- Promote other users to admin status
- Delete users (cannot delete your own account)
- See admin status for each user

## API Endpoints

The following API endpoints are available for admins only:

### Recipes Management
- `GET /api/admin/recipes` - List all recipes
- `PUT /api/admin/recipes/[id]` - Update any recipe
- `DELETE /api/admin/recipes/[id]` - Delete any recipe

### Users Management
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/[id]` - Update user (change name, promote to admin)
- `DELETE /api/admin/users/[id]` - Delete user

## Authentication Requirements

All admin endpoints require:
1. Valid JWT token in Authorization header or auth_token cookie
2. The authenticated user must have `is_admin: true`

Example request:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-app.com/api/admin/recipes
```

## Security Notes

- Admin operations require authentication
- Admin endpoints check `isAdmin` flag on every request
- Users cannot delete their own account
- All actions are logged through the standard API response system
- Sensitive data (passwords) is never exposed in admin views

## Testing

To test the admin panel locally:

1. Run migrations: `npm run migrate`
2. Seed test data: `npm run seed`
3. Promote admin user via SQL:
   ```sql
   UPDATE users SET is_admin = true WHERE id = 1;
   ```
4. Start the dev server: `npm run dev`
5. Login with `alice@example.com` / `password123`
6. Click "Admin Panel" in the header
