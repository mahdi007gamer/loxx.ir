export function Logo({ compact = false }: { compact?: boolean }) {
  return <a className={`logo brand-logo${compact ? ' brand-logo-compact' : ''}`} href="/" aria-label="استودیو LOXX، صفحه اصلی">
    <img src={compact ? '/brand/loxx-symbol.webp' : '/brand/loxx-wordmark-nav.webp'} alt="LOXX — Digital Product Studio" width={compact ? 180 : 426} height={compact ? 155 : 151} />
  </a>;
}
