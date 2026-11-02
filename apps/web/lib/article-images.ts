import images from '../../../content/article-images.json';

export type ArticleImage = { src: string; alt: string; caption: string; width: number; height: number; afterHeading?: string };
export type ArticleImageSet = { slug: string; cover: ArticleImage; inline: ArticleImage[] };
const sets = new Map((images as ArticleImageSet[]).map(set => [set.slug, set]));
export const getArticleImages = (slug: string) => sets.get(slug);
export function markdownImageSources(body: string) {
  return [...body.matchAll(/^!\[[^\]]+\]\((\/images\/[a-zA-Z0-9_/-]+\.(?:webp|png|jpe?g|avif))(?:\s+"[^"\r\n]*")?\)$/gm)].map(match => match[1]);
}
