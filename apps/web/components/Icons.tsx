import type { CSSProperties } from 'react';
export type IconName = 'arrow'|'play'|'monitor'|'phone'|'settings'|'design'|'cart'|'layers'|'users'|'shield'|'clock'|'heart'|'idea'|'chat'|'code'|'rocket'|'menu'|'close'|'check'|'globe'|'grid'|'chevron';
const paths: Record<IconName, React.ReactNode> = {
  arrow: <><path d="M5 12h14m-6-6 6 6-6 6"/></>,
  play: <path d="m9 5 10 7-10 7Z"/>,
  monitor: <><rect x="2" y="3" width="20" height="14" rx="1"/><path d="M8 21h8m-4-4v4"/></>,
  phone: <><rect x="6" y="1" width="12" height="22" rx="2"/><path d="M10 4h4m-3 16h2"/></>,
  settings: <><path d="m10 2 4 0 .8 3 2 .9 2.8-.8 2 3.4-2.2 2.2v2.6l2.2 2.2-2 3.4-2.8-.8-2 .9-.8 3h-4l-.8-3-2-.9-2.8.8-2-3.4 2.2-2.2v-2.6L2.4 8.5l2-3.4 2.8.8 2-.9Z"/><circle cx="12" cy="12" r="3"/></>,
  design: <><path d="m5 17 12-12 3 3L8 20l-5 1 1-5Zm9-9 3 3M5 3v4m-2-2h4m12 12v4m-2-2h4"/><path d="m17 3 2-2 4 4-2 2"/></>,
  cart: <><path d="M2 3h3l3 13h11l3-10H6m3 6h10"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></>,
  layers: <><path d="m2 7 10-5 10 5-10 5Zm0 5 10 5 10-5M2 17l10 5 10-5"/></>,
  users: <><circle cx="8" cy="7" r="3"/><circle cx="18" cy="7" r="3"/><path d="M2 21v-4a6 6 0 0 1 12 0v4Zm13-9a5 5 0 0 1 7 5v4h-5"/></>,
  shield: <><path d="m12 2 9 4v6c0 5-5 8-9 10-4-2-9-5-9-10V6Zm0 0v5"/></>,
  clock: <><circle cx="12" cy="13" r="9"/><path d="M12 8v6l3 2M9 1h6m-3 0v3m7 0 2 2"/></>,
  heart: <path d="M12 21 3 12C-4 3 8-1 12 7c4-8 16-4 9 5Z"/>,
  idea: <><path d="M8 17c0-3-4-4-4-8a8 8 0 0 1 16 0c0 4-4 5-4 8Zm1 4h6m-4-4V9l3-2"/></>,
  chat: <><path d="M3 3h18v15H9l-6 4Zm4 5h10M7 12h7"/></>,
  code: <><path d="m7 5-6 7 6 7m10-14 6 7-6 7M14 2l-4 20"/></>,
  rocket: <><path d="M10 14C10 5 17 2 22 2c0 5-3 12-12 12Zm0-7H5l-3 6h8m7 1v5l-6 3v-8M7 17c-4-1-5 2-5 5 3 0 6-1 5-5Z"/><circle cx="17" cy="7" r="2"/></>,
  menu: <path d="M3 5h18M3 12h18M3 19h18"/>, close: <path d="m5 5 14 14M19 5 5 19"/>, check: <path d="m4 12 5 5L20 6"/>,
  globe: <><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20"/></>,
  grid: <><circle cx="5" cy="5" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="19" cy="5" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="19" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="19" cy="19" r="1"/></>,
  chevron: <path d="m9 5 7 7-7 7"/>
};
export function Icon({name, size=24, className='', style}: {name:IconName;size?:number;className?:string;style?:CSSProperties}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className} style={style}>{paths[name]}</svg> }
