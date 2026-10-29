import type { Metadata } from 'next';

const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
function normalizedSiteUrl(): { origin: string; explicit: boolean } {
  try {
    const candidate = new URL(configuredUrl || 'https://loxx.ir');
    if (!['http:', 'https:'].includes(candidate.protocol)) throw new Error('Invalid protocol');
    return { origin: candidate.origin, explicit: Boolean(configuredUrl) };
  } catch {
    return { origin: 'https://loxx.ir', explicit: false };
  }
}
const normalizedSite = normalizedSiteUrl();
export const siteUrl = normalizedSite.origin;
export const brandName = 'LOXX';
export const contactPhone = '+989375302400';
export const contactPhoneDisplay = '۰۹۳۷۵۳۰۲۴۰۰';
export const contentUpdatedAt = '2026-10-29';

export function absoluteUrl(path = '/') { return new URL(path, siteUrl).toString(); }
export function indexingEnabled() {
  const hostname = new URL(siteUrl).hostname.toLowerCase();
  const isPrivateHost = hostname === 'localhost' || hostname === '[::1]' || hostname === '::1' ||
    hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.test') ||
    /^(127\.|0\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
  // Production indexing is an explicit release choice. Local builds and previews stay noindex.
  return process.env.NODE_ENV === 'production' && normalizedSite.explicit && !isPrivateHost &&
    process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'false';
}

export function pageMetadata(title: string, description: string, pathname: string, image = '/images/hero-desktop.webp'): Metadata {
  return {
    title, description, alternates: { canonical: absoluteUrl(pathname) },
    openGraph: { title: `${title} | LOXX`, description, url: absoluteUrl(pathname), type: 'website', locale: 'fa_IR', siteName: 'LOXX', images: [{ url: absoluteUrl(image), alt: title }] },
    twitter: { card: 'summary_large_image', title, description, images: [absoluteUrl(image)] },
    robots: { index: indexingEnabled(), follow: true },
  };
}

export function jsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, '\\u003c'); }

export const organizationSchema = {
  '@context': 'https://schema.org', '@type': 'Organization', '@id': absoluteUrl('/#organization'),
  name: 'LOXX', alternateName: ['لوکس', 'LOXX Digital Product Studio'], url: siteUrl,
  logo: absoluteUrl('/brand/loxx-symbol.webp'),
  description: 'استودیو طراحی و توسعه وب‌سایت، اپلیکیشن و نرم‌افزارهای اختصاصی؛ از تعریف مسئله تا ساخت و توسعه محصول.',
  telephone: contactPhone,
  contactPoint: [{ '@type': 'ContactPoint', telephone: contactPhone, contactType: 'sales', availableLanguage: ['Persian'] }],
  knowsAbout: ['طراحی وب‌سایت', 'طراحی UI/UX', 'توسعه اپلیکیشن', 'CRM اختصاصی', 'نرم‌افزار سازمانی'],
};
export const websiteSchema = {
  '@context': 'https://schema.org', '@type': 'WebSite', '@id': absoluteUrl('/#website'),
  name: 'LOXX', alternateName: 'لوکس استودیو', url: siteUrl, inLanguage: 'fa-IR',
  publisher: { '@id': absoluteUrl('/#organization') },
};

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}
