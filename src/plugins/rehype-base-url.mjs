// Rehype plugin: prepend base URL to internal absolute links in MDX content.
// This ensures markdown links like [text](/zh/articles/foo) work correctly
// when deployed under a subpath (e.g., GitHub Pages with base: '/repo-name').
import { visit } from 'unist-util-visit';

export default function rehypeBaseUrl(options = {}) {
  const base = options.base || '/';
  if (base === '/') return () => {};

  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && typeof node.properties?.href === 'string') {
        const href = node.properties.href;
        if (href.startsWith('/') && !href.startsWith(base)) {
          node.properties.href = base.replace(/\/$/, '') + href;
        }
      }
    });
  };
}
