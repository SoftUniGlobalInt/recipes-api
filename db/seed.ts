import 'dotenv/config';
import postgres from 'postgres';
import bcryptjs from 'bcryptjs';

async function seed() {
  const connectionString = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const client = postgres(connectionString);

  try {
    console.log('Starting seed...');

    // Hash passwords
    const password1 = await bcryptjs.hash('password123', 10);
    const password2 = await bcryptjs.hash('password456', 10);
    const password3 = await bcryptjs.hash('password789', 10);

    // Insert users
    await client`
      INSERT INTO users (email, password, name) VALUES
      ('alice@example.com', ${password1}, 'Alice Johnson'),
      ('bob@example.com', ${password2}, 'Bob Smith'),
      ('charlie@example.com', ${password3}, 'Charlie Brown')
      RETURNING id
    `;

    console.log('✓ Created 3 users');

    // Get user IDs for recipe insertion
    const users = await client`SELECT id FROM users ORDER BY id`;

    // Sample recipe data
    const recipes = [
      // Alice's recipes (5)
      {
        userId: users[0].id,
        title: 'Classic Spaghetti Carbonara',
        description: 'Traditional Italian pasta with creamy egg sauce',
        ingredients: 'Spaghetti, eggs, guanciale, pecorino romano cheese, black pepper',
        instructions: '1. Cook spaghetti. 2. Fry guanciale. 3. Mix eggs with cheese. 4. Combine with pasta and guanciale. 5. Season with pepper.',
        cookingTime: 20,
        servings: 4,
        tags: 'italian,pasta,dinner',
      },
      {
        userId: users[0].id,
        title: 'Homemade Margherita Pizza',
        description: 'Fresh pizza with tomato, mozzarella, and basil',
        ingredients: 'Pizza dough, tomato sauce, mozzarella, fresh basil, olive oil',
        instructions: '1. Prepare dough. 2. Spread sauce. 3. Add mozzarella. 4. Bake at 450°F for 12 minutes. 5. Top with basil.',
        cookingTime: 25,
        servings: 4,
        tags: 'italian,pizza,vegetarian',
      },
      {
        userId: users[0].id,
        title: 'Greek Salad',
        description: 'Fresh Mediterranean salad with feta cheese',
        ingredients: 'Tomatoes, cucumber, red onion, feta cheese, olives, olive oil, oregano',
        instructions: '1. Chop vegetables. 2. Combine tomatoes, cucumber, onion. 3. Add olives. 4. Crumble feta. 5. Drizzle with oil and oregano.',
        cookingTime: 10,
        servings: 2,
        tags: 'salad,vegetarian,healthy,mediterranean',
      },
      {
        userId: users[0].id,
        title: 'Beef Stir Fry',
        description: 'Quick Asian-inspired beef with vegetables',
        ingredients: 'Beef sirloin, bell peppers, broccoli, soy sauce, garlic, ginger, sesame oil',
        instructions: '1. Cut beef thin. 2. Heat wok. 3. Stir fry beef. 4. Add vegetables. 5. Add sauce and serve over rice.',
        cookingTime: 15,
        servings: 3,
        tags: 'asian,beef,quick,dinner',
      },
      {
        userId: users[0].id,
        title: 'Chocolate Chip Cookies',
        description: 'Classic soft and chewy cookies',
        ingredients: 'Flour, butter, sugar, brown sugar, eggs, vanilla, baking soda, chocolate chips',
        instructions: '1. Cream butter and sugars. 2. Add eggs and vanilla. 3. Mix in flour and baking soda. 4. Fold in chocolate chips. 5. Bake at 375°F for 10 minutes.',
        cookingTime: 12,
        servings: 24,
        tags: 'dessert,baking,sweet',
      },
      // Bob's recipes (5)
      {
        userId: users[1].id,
        title: 'Chicken Tikka Masala',
        description: 'Creamy Indian chicken curry',
        ingredients: 'Chicken breast, yogurt, tomato sauce, cream, garam masala, turmeric, garlic',
        instructions: '1. Marinate chicken. 2. Cook chicken. 3. Make sauce with tomatoes and cream. 4. Add spices. 5. Simmer 15 minutes.',
        cookingTime: 35,
        servings: 4,
        tags: 'indian,chicken,curry,spicy',
      },
      {
        userId: users[1].id,
        title: 'Tacos al Pastor',
        description: 'Mexican marinated pork tacos',
        ingredients: 'Pork shoulder, pineapple, dried chiles, vinegar, tortillas, onion, cilantro',
        instructions: '1. Marinate pork overnight. 2. Cook on vertical spit or oven. 3. Slice thin. 4. Serve in tortillas with pineapple.',
        cookingTime: 40,
        servings: 6,
        tags: 'mexican,pork,tacos,street-food',
      },
      {
        userId: users[1].id,
        title: 'Caesar Salad',
        description: 'Crispy salad with creamy Caesar dressing',
        ingredients: 'Romaine lettuce, parmesan cheese, croutons, Caesar dressing, lemon juice',
        instructions: '1. Tear romaine lettuce. 2. Make or use Caesar dressing. 3. Toss lettuce with dressing. 4. Top with croutons and parmesan.',
        cookingTime: 10,
        servings: 2,
        tags: 'salad,vegetarian,classic',
      },
      {
        userId: users[1].id,
        title: 'Sushi Rolls',
        description: 'Homemade California rolls with fresh ingredients',
        ingredients: 'Sushi rice, nori, crab stick, avocado, cucumber, soy sauce, wasabi',
        instructions: '1. Cook and season rice. 2. Place on nori. 3. Add fillings. 4. Roll tightly. 5. Slice and serve.',
        cookingTime: 30,
        servings: 4,
        tags: 'japanese,sushi,seafood,asian',
      },
      {
        userId: users[1].id,
        title: 'Brownies',
        description: 'Rich and fudgy chocolate brownies',
        ingredients: 'Chocolate, butter, sugar, eggs, flour, cocoa powder, vanilla',
        instructions: '1. Melt chocolate and butter. 2. Mix with sugar and eggs. 3. Add flour and cocoa. 4. Bake at 350°F for 25 minutes.',
        cookingTime: 30,
        servings: 12,
        tags: 'dessert,chocolate,baking',
      },
      // Charlie's recipes (5)
      {
        userId: users[2].id,
        title: 'Pad Thai',
        description: 'Thai noodle stir-fry with shrimp and peanuts',
        ingredients: 'Rice noodles, shrimp, peanuts, lime, fish sauce, tamarind, eggs, bean sprouts',
        instructions: '1. Cook noodles. 2. Stir fry shrimp. 3. Add noodles and sauce. 4. Add peanuts. 5. Serve with lime.',
        cookingTime: 20,
        servings: 3,
        tags: 'thai,noodles,seafood,asian',
      },
      {
        userId: users[2].id,
        title: 'Beef Burger',
        description: 'Juicy homemade beef burger',
        ingredients: 'Ground beef, burger bun, lettuce, tomato, onion, cheese, pickles, condiments',
        instructions: '1. Form beef patty. 2. Grill to desired doneness. 3. Toast bun. 4. Assemble with toppings.',
        cookingTime: 12,
        servings: 2,
        tags: 'burger,beef,fast-food,american',
      },
      {
        userId: users[2].id,
        title: 'Vegetable Curry',
        description: 'Creamy vegetarian curry with mixed vegetables',
        ingredients: 'Carrots, potatoes, peas, onions, garlic, coconut milk, curry paste, ginger',
        instructions: '1. Sauté aromatics. 2. Add curry paste. 3. Add vegetables. 4. Pour coconut milk. 5. Simmer 20 minutes.',
        cookingTime: 30,
        servings: 4,
        tags: 'curry,vegetarian,healthy,indian',
      },
      {
        userId: users[2].id,
        title: 'French Onion Soup',
        description: 'Rich caramelized onion soup with cheese topping',
        ingredients: 'Onions, beef broth, wine, baguette, gruyere cheese, thyme, butter',
        instructions: '1. Caramelize onions slowly. 2. Add broth and wine. 3. Simmer 30 minutes. 4. Top with bread and cheese. 5. Broil.',
        cookingTime: 50,
        servings: 4,
        tags: 'soup,french,classic,comfort-food',
      },
      {
        userId: users[2].id,
        title: 'Lemon Cheesecake',
        description: 'Creamy cheesecake with tangy lemon flavor',
        ingredients: 'Graham cracker crust, cream cheese, sugar, eggs, lemon juice, lemon zest, sour cream',
        instructions: '1. Make crust. 2. Beat cream cheese smooth. 3. Add sugar and eggs. 4. Mix in lemon juice and zest. 5. Bake at 325°F for 55 minutes.',
        cookingTime: 70,
        servings: 8,
        tags: 'dessert,cheesecake,baking,citrus',
      },
    ];

    // Insert recipes
    for (const recipe of recipes) {
      await client`
        INSERT INTO recipes 
        (title, description, ingredients, instructions, cooking_time, servings, tags, user_id) 
        VALUES 
        (${recipe.title}, ${recipe.description}, ${recipe.ingredients}, ${recipe.instructions}, ${recipe.cookingTime}, ${recipe.servings}, ${recipe.tags}, ${recipe.userId})
      `;
    }

    console.log('✓ Created 15 recipes');
    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
