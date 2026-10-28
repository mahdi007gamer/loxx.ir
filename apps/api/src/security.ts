import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

const SECRET = process.env.SESSION_SECRET || '';
const COOKIE = 'loxx_session';
export const hashPassword = (value: string) => {
  const salt = randomBytes(16).toString('hex');
  return salt + ':' + scryptSync(value, salt, 64).toString('hex');
};
export const verifyPassword = (value: string, stored: string) => {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const actual = scryptSync(value, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};
export type Session = { id: string; role: string; exp: number };
const sign = (payload: string) => createHmac('sha256', SECRET).update(payload).digest('base64url');
export function setSession(res: Response, id: string, role: string) {
  if (SECRET.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters');
  const payload = Buffer.from(JSON.stringify({ id, role, exp: Date.now() + 7 * 86400000 })).toString('base64url');
  res.cookie(COOKIE, payload + '.' + sign(payload), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 86400000, path: '/'
  });
}
export function clearSession(res: Response) {
  res.clearCookie(COOKIE, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
}
export function session(req: Request): Session | null {
  const cookies = (req.headers.cookie || '').split(';').map(p => p.trim());
  const token = cookies.find(p => p.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const data: Session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp <= Date.now() || typeof data.id !== 'string') return null;
    return data;
  } catch { return null; }
}
export function requireUser(req: Request, admin = false): Session {
  const data = session(req);
  if (!data) throw new UnauthorizedException('لطفاً وارد حساب کاربری شوید.');
  if (admin && data.role !== 'admin') throw new ForbiddenException('دسترسی مجاز نیست.');
  return data;
}
export function requireTrustedOrigin(req: Request) {
  const origin = req.headers.origin;
  const trusted = (process.env.WEB_ORIGIN || 'http://localhost:3000').split(',').map(x => x.trim());
  if (origin && !trusted.includes(origin)) throw new ForbiddenException('Origin not allowed');
}
