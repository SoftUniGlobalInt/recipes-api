export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function validateRegisterInput(
  email: string,
  password: string,
  name: string
): string | null {
  if (!email || !password || !name) {
    return 'Email, password, and name are required';
  }

  if (!isValidEmail(email)) {
    return 'Email must be valid';
  }

  if (!isValidPassword(password)) {
    return 'Password must be at least 6 characters';
  }

  return null;
}

export interface RecipeInput {
  title?: string;
  description?: string;
  ingredients?: string;
  instructions?: string;
  cookingTime?: number | null;
  servings?: number | null;
  tags?: string | null;
}

export function validateRecipeInput(
  recipe: RecipeInput,
  requireAllFields = false
): string | null {
  if (requireAllFields) {
    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      return 'Title, ingredients, and instructions are required';
    }
  }

  if (recipe.title !== undefined && recipe.title.trim().length === 0) {
    return 'Title must not be empty';
  }

  if (recipe.ingredients !== undefined && recipe.ingredients.trim().length === 0) {
    return 'Ingredients must not be empty';
  }

  if (recipe.instructions !== undefined && recipe.instructions.trim().length === 0) {
    return 'Instructions must not be empty';
  }

  return null;
}
