import type { MetadataRoute } from 'next';
import { getPublishedArticles } from '@/lib/posts';
import { buildSitemapEntries } from '@/lib/sitemap-entries';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemapEntries(await getPublishedArticles());
}
