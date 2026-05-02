export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin?: boolean;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  cookingTime: number | null;
  servings: number | null;
  tags: string | null;
  photoUrl?: string | null;
  userId: number;
  user?: {
    id?: number;
    name: string;
    email: string;
  } | null;
  dateCreated?: string;
}

export interface PaginatedRecipes {
  recipes: Recipe[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
