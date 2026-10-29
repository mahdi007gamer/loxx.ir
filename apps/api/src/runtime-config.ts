type Environment = Record<string, string | undefined>;
const placeholder = /replace[-_ ]?with|change[-_ ]?me|your[-_ ]?(?:secret|password)|example[-_ ]?(?:secret|password)/i;

export function isPrivateHost(host: string) {
  const value = host.toLowerCase().replace(/^\[|\]$/g, '');
  if (value.includes(':')) return value === '::' || value === '::1' || value.startsWith('::ffff:') || /^(?:fc|fd)[0-9a-f]*:|^fe[89ab][0-9a-f]*:/i.test(value);
  return !value.includes('.') || value === 'localhost'
    || /(?:\.localhost|\.local|\.internal|\.test|\.invalid|\.example)$/.test(value)
    || /^(?:0|10|127)\.|^169\.254\.|^192\.168\.|^172\.(?:1[6-9]|2\d|3[01])\./.test(value);
}

export function publicOrigin(value: string | undefined): string | null {
  try {
    const url = new URL(value || '');
    if (url.protocol !== 'https:' || url.username || url.password || isPrivateHost(url.hostname) || url.pathname !== '/' || url.search || url.hash) return null;
    return url.origin;
  } catch { return null; }
}

export function secretIsUsable(value: string | undefined, minimum: number) {
  return !!value && value.length >= minimum && !placeholder.test(value) && new Set(value).size >= 8;
}

export function runtimeIssues(env: Environment): string[] {
  const issues: string[] = [];
  if ((env.SESSION_SECRET || '').length < 32) issues.push('SESSION_SECRET must be at least 32 characters. Run npm run setup:local or configure a unique secret before starting the API.');
  if (env.NODE_ENV !== 'production') return issues;
  if (!issues.length && !secretIsUsable(env.SESSION_SECRET, 32)) issues.push('SESSION_SECRET must be a unique random value, not a sample or repeated string.');
  if (!env.DATABASE_URL?.startsWith('file:') || env.DATABASE_URL === 'file::memory:') issues.push('DATABASE_URL must point to a persistent SQLite file.');
  const origins = (env.WEB_ORIGIN || '').split(',').map(value => value.trim());
  if (!origins.length || origins.some(origin => publicOrigin(origin) !== origin)) issues.push('WEB_ORIGIN must contain exact public HTTPS origins without paths, trailing slashes or wildcards.');
  return issues;
}
