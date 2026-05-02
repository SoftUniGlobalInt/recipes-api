import { NextRequest } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { db } from '@/db';
import { recipes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-response';
import { verifyAuth } from '@/lib/auth-middleware';
import { validateRecipeInput } from '@/lib/validation';
import { getR2ObjectKeyFromUrl, getS3Client, r2BucketName } from '@/lib/r2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipeId = parseInt(id);

    if (isNaN(recipeId)) {
      return errorResponse('Invalid recipe ID', 400);
    }

    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, recipeId),
    });

    if (!recipe) {
      return notFoundResponse();
    }

    return successResponse(recipe);
  } catch (error) {
    console.error('Get recipe error:', error);
    return errorResponse('Failed to fetch recipe', 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAuth(request);

    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const recipeId = parseInt(id);

    if (isNaN(recipeId)) {
      return errorResponse('Invalid recipe ID', 400);
    }

    // Check if recipe exists and belongs to user
    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, recipeId),
    });

    if (!recipe) {
      return notFoundResponse();
    }

    if (recipe.userId !== auth.id) {
      return forbiddenResponse();
    }

    // Get update data
    const updateData = await request.json();
    const {
      title,
      description,
      ingredients,
      instructions,
      cookingTime,
      servings,
      tags,
      photoUrl,
    } = updateData;

    const validationError = validateRecipeInput({
      title,
      ingredients,
      instructions,
    });

    if (validationError) {
      return errorResponse(validationError, 400);
    }

    // Update recipe
    const updated = await db
      .update(recipes)
      .set({
        title: title ?? recipe.title,
        description: description ?? recipe.description,
        ingredients: ingredients ?? recipe.ingredients,
        instructions: instructions ?? recipe.instructions,
        cookingTime: cookingTime ?? recipe.cookingTime,
        servings: servings ?? recipe.servings,
        tags: tags ?? recipe.tags,
        photoUrl: photoUrl === undefined ? recipe.photoUrl : photoUrl,
      })
      .where(eq(recipes.id, recipeId))
      .returning();

    return successResponse(updated[0]);
  } catch (error) {
    console.error('Update recipe error:', error);
    return errorResponse('Failed to update recipe', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAuth(request);

    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const recipeId = parseInt(id);

    if (isNaN(recipeId)) {
      return errorResponse('Invalid recipe ID', 400);
    }

    // Check if recipe exists and belongs to user
    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, recipeId),
    });

    if (!recipe) {
      return notFoundResponse();
    }

    if (recipe.userId !== auth.id) {
      return forbiddenResponse();
    }

    // Delete cover image from R2 if present.
    if (recipe.photoUrl) {
      try {
        const objectKey = getR2ObjectKeyFromUrl(recipe.photoUrl);
        if (objectKey) {
          const client = getS3Client();
          await client.send(
            new DeleteObjectCommand({
              Bucket: r2BucketName,
              Key: objectKey,
            })
          );
        }
      } catch (uploadError) {
        console.error('Failed to delete recipe photo from R2:', uploadError);
      }
    }

    // Delete recipe row once cleanup is attempted.
    await db.delete(recipes).where(eq(recipes.id, recipeId));

    return successResponse({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    return errorResponse('Failed to delete recipe', 500);
  }
}
