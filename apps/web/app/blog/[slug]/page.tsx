import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { articles } from '@/lib/content';
export function generateStaticParams(){return articles.map(a=>({slug:a.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return {title:articles.find(a=>a.slug===slug)?.title||'یادداشت'}}
export default async function Article({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const a=articles.find(a=>a.slug===slug);if(!a)notFound();return <><Header/><main id="main" className="container subpage"><article className="article-body"><a className="text-link" href="/blog">بازگشت به یادداشت‌ها ←</a><h1>{a.title}</h1><p>{a.body}</p><a className="text-link" href="/#contact">درباره پروژه‌تان گفت‌وگو کنیم ←</a></article></main></>}
