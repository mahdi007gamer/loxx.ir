import type { MetadataRoute } from 'next';
import { absoluteUrl, contentUpdatedAt } from './seo';
import { servicePages } from './service-pages';

type SitemapArticle = { slug: string; createdAt?: string; updatedAt?: string };
const homeContentUpdatedAt = '2026-11-02';
function latestDate(fallback: string, dates: (string | undefined)[]) {
  return dates.reduce<string>((latest, value) => value && Number.isFinite(Date.parse(value)) && Date.parse(value) > Date.parse(latest) ? value : latest, fallback);
}

export function buildSitemapEntries(posts: SitemapArticle[]): MetadataRoute.Sitemap {
  const latestArticle = latestDate(contentUpdatedAt, posts.map(post => post.updatedAt || post.createdAt));
  const fixed: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: latestDate(homeContentUpdatedAt, [latestArticle]) },
    { url: absoluteUrl('/blog'), lastModified: latestArticle },
    { url: absoluteUrl('/privacy'), lastModified: contentUpdatedAt },
    { url: absoluteUrl('/terms'), lastModified: contentUpdatedAt },
    ...servicePages.map(service => ({ url: absoluteUrl(`/services/${service.slug}`), lastModified: contentUpdatedAt })),
    ...['goldencheat-store', 'goldencheat-panel', 'ahmadi-design', 'mehrad-kavir'].map(slug => ({ url: absoluteUrl(`/work/${slug}`), lastModified: contentUpdatedAt })),
  ];
  return [...fixed, ...posts.map(post => ({ url: absoluteUrl(`/blog/${post.slug}`), lastModified: latestDate(contentUpdatedAt, [post.createdAt, post.updatedAt]) }))];
}
