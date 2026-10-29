'use client';

import { useState, type CSSProperties } from 'react';
import { Icon } from './Icons';
import { portfolioFilters, portfolioProjects, type PortfolioCategory, type PortfolioProject } from '@/lib/portfolio';

export function ProjectIdentity({ project }: { project: PortfolioProject }) {
  return <div className="caseport-identity" aria-label={project.imageAlt}>
    <span className="caseport-identity-orbit" aria-hidden="true"/>
    <div className="caseport-identity-core" aria-hidden="true"><span>M</span><i>×</i><span>A</span></div>
    <div className="caseport-identity-copy" lang="en"><span>PRODUCT / DESIGN / EXPERIENCE</span><strong>MAHDI<br/>AHMADI<span>®</span></strong><small>Ahmadi Design</small></div>
    <span className="caseport-identity-caption">نمای هویت پروژه · گرافیک معرفی</span>
  </div>;
}

export function WorkGallery() {
  const [filter, setFilter] = useState<PortfolioCategory | 'all'>('all');
  const visible = portfolioProjects.filter(project => filter === 'all' || project.category === filter);

  return <>
    <div className="caseport-toolbar">
      <div className="caseport-filters" role="group" aria-label="فیلتر نمونه‌کارها">
        {portfolioFilters.map(item => <button key={item.id} type="button" aria-pressed={filter === item.id}
          onClick={() => setFilter(item.id)}>{item.label}</button>)}
      </div>
      <p className="caseport-count" role="status"><span aria-hidden="true"/>{visible.length.toLocaleString('fa-IR')} نمونه قابل بررسی</p>
    </div>
    <div className={`caseport-grid${filter !== 'all' ? ' caseport-filtered' : ''}`}>
      {visible.map(project => <a className={`caseport-card caseport-${project.slug}`} href={`/work/${project.slug}`} key={project.slug}
        style={{ '--case-accent': project.accent } as CSSProperties} aria-label={`جزئیات ${project.title}`}>
        <div className="caseport-visual">
          <div className="caseport-browser"><span><i/><i/><i/></span><small dir="ltr">{project.domain}</small><Icon name="shield" size={12}/></div>
          <div className="caseport-viewport">{project.image ? <img src={project.image} width="1280" height="870" alt={project.imageAlt} loading="lazy"/> : <ProjectIdentity project={project}/>}</div>
          <span className={`caseport-status caseport-status-${project.statusKind}`}><i/>{project.status}</span>
        </div>
        <div className="caseport-card-body">
          <div className="caseport-project-label"><span>{project.categoryLabel}</span><span lang="en">{project.englishName}</span></div>
          <h3>{project.title}</h3><p>{project.summary}</p>
          <div className="caseport-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
          <div className="caseport-card-bottom"><span>داستان و جزئیات پروژه</span><span className="caseport-open"><Icon name="arrow" size={21}/></span></div>
        </div>
      </a>)}
    </div>
  </>;
}
