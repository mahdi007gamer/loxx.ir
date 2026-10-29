import type { MetadataRoute } from 'next';
import { absoluteUrl, contentUpdatedAt } from '@/lib/seo';
import { servicePages } from '@/lib/service-pages';
import { getPublishedArticles } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedArticles();
  const fixed: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: contentUpdatedAt },
    { url: absoluteUrl('/blog'), lastModified: contentUpdatedAt },
    { url: absoluteUrl('/privacy'), lastModified: contentUpdatedAt },
    { url: absoluteUrl('/terms'), lastModified: contentUpdatedAt },
    ...servicePages.map(service => ({ url: absoluteUrl(`/services/${service.slug}`), lastModified: contentUpdatedAt })),
    ...['goldencheat-store', 'goldencheat-panel', 'ahmadi-design', 'mehrad-kavir'].map(slug => ({ url: absoluteUrl(`/work/${slug}`), lastModified: contentUpdatedAt })),
  ];
  return [...fixed, ...posts.map(post => ({ url: absoluteUrl(`/blog/${post.slug}`), lastModified: post.updatedAt || post.createdAt || contentUpdatedAt }))];
}
