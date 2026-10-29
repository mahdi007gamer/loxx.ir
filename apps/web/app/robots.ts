import type { MetadataRoute } from 'next';
import { absoluteUrl, indexingEnabled, siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  if (!indexingEnabled()) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/admin/', '/login', '/api/'] },
    sitemap: absoluteUrl('/sitemap.xml'), host: siteUrl,
  };
}
