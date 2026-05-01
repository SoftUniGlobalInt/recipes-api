import { S3Client } from '@aws-sdk/client-s3';

const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET || process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.R2_URL || process.env.R2_ENDPOINT;
const R2_PUBLIC_URL_BASE = process.env.R2_PUBLIC_URL || process.env.R2_PUBLIC_URL_BASE;

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  // Environment variables are validated on first use in getS3Client or getR2PublicUrl.
}

export function getS3Client() {
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_ENDPOINT) {
    throw new Error('Missing R2 credentials or endpoint in environment variables.');
  }

  return new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export const r2BucketName = R2_BUCKET_NAME;

export function getR2PublicUrl(key: string) {
  if (R2_PUBLIC_URL_BASE) {
    return `${R2_PUBLIC_URL_BASE.replace(/\/+$/, '')}/${key}`;
  }

  if (!R2_ENDPOINT || !R2_BUCKET_NAME) {
    throw new Error('Missing R2 public URL base or endpoint/bucket configuration.');
  }

  return `${R2_ENDPOINT.replace(/\/+$/, '')}/${R2_BUCKET_NAME}/${key}`;
}

export function getR2ObjectKeyFromUrl(urlString: string) {
  try {
    const url = new URL(urlString);
    const pathname = url.pathname.replace(/^\/+/, '');

    if (R2_PUBLIC_URL_BASE) {
      const normalizedBase = R2_PUBLIC_URL_BASE.replace(/\/+$/, '');
      if (urlString.startsWith(normalizedBase)) {
        return pathname;
      }
    }

    if (R2_BUCKET_NAME && pathname.startsWith(`${R2_BUCKET_NAME}/`)) {
      return pathname.slice(R2_BUCKET_NAME.length + 1);
    }

    return pathname;
  } catch {
    return null;
  }
}
