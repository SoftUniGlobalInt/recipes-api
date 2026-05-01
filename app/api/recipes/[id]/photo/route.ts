import { NextRequest } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
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
import { getR2PublicUrl, getS3Client, r2BucketName } from '@/lib/r2';

function getFileExtension(fileName: string, mimeType: string) {
  const nameParts = fileName.split('.');
  if (nameParts.length > 1) {
    return nameParts.pop();
  }

  const mimeParts = mimeType.split('/');
  return mimeParts.length > 1 ? mimeParts[1] : 'jpg';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
      return errorResponse('Invalid recipe ID', 400);
    }

    const recipe = await db.query.recipes.findFirst({
      where: eq(recipes.id, recipeId),
    });

    if (!recipe) {
      return notFoundResponse();
    }

    if (recipe.userId !== auth.userId) {
      return forbiddenResponse();
    }

    const formData = await request.formData();
    const file = formData.get('photo');

    if (!(file instanceof File)) {
      return errorResponse('Photo file is required', 400);
    }

    const extension = getFileExtension(file.name, file.type);
    const key = `recipes/${recipeId}-${crypto.randomUUID()}.${extension}`;
    const body = await file.arrayBuffer();

    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: r2BucketName,
        Key: key,
        Body: Buffer.from(body),
        ContentType: file.type,
      })
    );

    const photoUrl = getR2PublicUrl(key);
    const updated = await db
      .update(recipes)
      .set({ photoUrl })
      .where(eq(recipes.id, recipeId))
      .returning();

    return successResponse({ photoUrl, recipe: updated[0] });
  } catch (error) {
    console.error('Upload recipe photo error:', error);
    return errorResponse('Failed to upload recipe photo', 500);
  }
}
