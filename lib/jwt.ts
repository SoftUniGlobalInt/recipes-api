import jwt from 'jsonwebtoken';

const SECRET: jwt.Secret = process.env.JWT_SECRET ?? 'default_jwt_secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: number;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  return (jwt.sign as any)(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return (jwt.verify as any)(token, SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}
