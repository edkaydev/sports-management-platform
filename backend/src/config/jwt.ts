import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_SECRET ?? 'dev_secret_change_in_production_please';
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

export interface AccessTokenPayload {
  sub: string;
  role: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = { expiresIn: ACCESS_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export function generateRefreshToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = crypto.randomBytes(48).toString('base64url');
  return {
    token,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + msFromExpiresIn(REFRESH_EXPIRES_IN)),
  };
}

export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function msFromExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  switch (match[2]) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}
