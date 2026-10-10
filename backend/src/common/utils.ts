import { randomBytes } from 'crypto';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Read a value from an untyped request body as a trimmed string. */
export const str = (v: unknown): string => (v == null ? '' : String(v)).trim();

/** Untrimmed string (for length checks on free text). */
export const raw = (v: unknown): string => (v == null ? '' : String(v));

export const bool = (v: unknown): boolean => v === true || v === 'true' || v === 1 || v === '1' || v === 'on';

/** Optional integer query parameter; returns undefined when blank or not a number. */
export const optInt = (v: unknown): number | undefined => {
  if (v == null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
};

/** "Inventory sync for Acme" → "inventory-sync-for-acme" */
export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);

/** Newline-separated text or an array → trimmed, non-empty strings. */
export const lines = (v: unknown): string[] =>
  (Array.isArray(v) ? v.map(String) : raw(v).split('\n')).map((x) => x.trim()).filter(Boolean);

/** Random upper-case base-36 code, e.g. "7Q2K9D". */
export const code = (len = 6) => {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const bytes = randomBytes(len);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
};

/** Local calendar date as YYYY-MM-DD, offset by n days. */
export const isoDay = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => '\\' + c);
