import assert from 'node:assert/strict';

export function insertArticleImages(body, images) {
  const slugs = [...new Set(images.map(image => image.src.split('/').slice(0, -1).join('/') + '/'))];
  const clean = body.split('\n').filter(line => !/^!\[/.test(line.trim()) || !slugs.some(prefix => line.includes('](' + prefix))).join('\n');
  const sections = clean.split(/(?=^## )/m).map(section => section.trim()).filter(Boolean);
  const used = new Set();
  for (const image of images) {
    assert.match(image.src, /^\/images\/articles\/[a-z0-9-]+\/detail-[12]\.webp$/);
    assert.ok(image.alt && image.caption && image.afterHeading, 'Image metadata is incomplete.');
    assert.ok(!used.has(image.afterHeading), 'Inline images require distinct sections.');
    used.add(image.afterHeading);
    const section = sections.findIndex(text => text.split('\n')[0] === '## ' + image.afterHeading);
    assert.ok(section >= 0, 'Missing target heading: ' + image.afterHeading);
    const alt = image.alt.replace(/[\[\]\r\n]/g, ' ').trim();
    const caption = image.caption.replace(/["\r\n]/g, ' ').trim();
    sections[section] += `\n\n![${alt}](${image.src} "${caption}")`;
  }
  return sections.join('\n\n');
}
