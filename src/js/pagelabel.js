// ---------------------------------------------------------------------------
// One place that knows how to say a page's name out loud: experience pages
// by their chapter, blog anchors by their note's title.
// ---------------------------------------------------------------------------
import { experience, posts } from './data.js';

const chapterByPage = Object.fromEntries(
  experience.filter((x) => x.page).map((x) => [x.page, x.org])
);
const postBySlug = Object.fromEntries(posts.map((p) => [p.slug, p.title]));

export function pageLabel(page) {
  if (chapterByPage[page]) return chapterByPage[page];
  const slug = (String(page).split('#')[1] || '').trim();
  return postBySlug[slug] || 'this page';
}
