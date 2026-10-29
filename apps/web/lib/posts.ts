import curatedPosts from '../../../content/articles.json';

export type Article = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  coverImage: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

const defaults = curatedPosts as Article[];
const validSlug = /^[a-z0-9-]{3,100}$/;
const fallback = () => defaults.filter(article => article.published);
const apiBase = () => (process.env.API_URL || 'http://127.0.0.1:4100').replace(/\/$/, '');

function normalizeArticle(value: unknown): Article | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  if (typeof row.slug !== 'string' || !validSlug.test(row.slug) || typeof row.title !== 'string' || row.published === false) return null;
  const str = (key: string, otherwise = '') => typeof row[key] === 'string' ? row[key] as string : otherwise;
  return {
    id: str('id') || undefined,
    slug: row.slug,
    title: row.title,
    excerpt: str('excerpt'),
    body: str('body'),
    category: str('category', 'راهنمای پروژه'),
    coverImage: str('coverImage', '/images/devices.webp'),
    metaTitle: str('metaTitle'),
    metaDescription: str('metaDescription'),
    keywords: str('keywords'),
    published: true,
    createdAt: str('createdAt', '2026-10-29T00:00:00.000Z'),
    updatedAt: str('updatedAt', str('createdAt', '2026-10-29T00:00:00.000Z')),
  };
}

// Healthy live responses always win, including an intentionally empty list or 404.
export async function getPublishedArticles(): Promise<Article[]> {
  try {
    const response = await fetch(apiBase() + '/api/articles', { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (response.status >= 400 && response.status < 500) return [];
    if (!response.ok) throw new Error('Article service unavailable');
    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid article list');
    return data.map(normalizeArticle).filter((article): article is Article => article !== null);
  } catch {
    return fallback();
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!validSlug.test(slug)) return null;
  try {
    const response = await fetch(apiBase() + '/api/articles/' + encodeURIComponent(slug), { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (response.status >= 400 && response.status < 500) return null;
    if (!response.ok) throw new Error('Article service unavailable');
    return normalizeArticle(await response.json());
  } catch {
    return fallback().find(article => article.slug === slug) || null;
  }
}

export const getPublishedPosts = getPublishedArticles;
export const getPostBySlug = getArticleBySlug;
export const readingMinutes = (body: string) => Math.max(1, Math.ceil(body.trim().split(/\s+/u).length / 180));
export const articleDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
};
