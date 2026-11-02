import guide from '../../../content/home-seo.json';
import { ArticleBody, parseArticle } from './ArticleBody';
import './seo-guide.css';

export function SeoGuide() {
  return <section className="seo-guide chapter-section" aria-labelledby="seo-guide-heading">
    <div className="container">
      <div className="seo-guide-intro">
        <p className="eyebrow">A PRACTICAL GUIDE TO YOUR NEXT WEBSITE</p>
        <h2 id="seo-guide-heading">{guide.title}</h2>
        {guide.intro.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <div className="seo-guide-sections">
        {guide.sections.map((section, index) => <details key={section.title} className="seo-guide-detail">
          <summary><h3>{section.title}</h3><span className="seo-guide-toggle" aria-hidden="true">+</span></summary>
          <div className="seo-guide-body" id={`seo-guide-section-${index + 1}`}><ArticleBody blocks={parseArticle(section.body)}/></div>
        </details>)}
      </div>
      <a className="text-link seo-guide-library" href="/blog">راهنماهای بیشتر برای سفارش و توسعه سایت ←</a>
    </div>
  </section>;
}
