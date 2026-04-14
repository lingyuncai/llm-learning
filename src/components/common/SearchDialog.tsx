import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';

// --- Types ---

interface PathItem {
  type: 'path';
  id: string;
  title: string;
  url: string;
}

interface TagItem {
  type: 'tag';
  name: string;
  url: string;
}

interface ArticleItem {
  type: 'article';
  slug: string;
  title: string;
  tags: string[];
  url: string;
}

type SearchItem = PathItem | TagItem | ArticleItem;

interface SearchData {
  paths: PathItem[];
  tags: TagItem[];
  articles: ArticleItem[];
}

interface Translations {
  search_placeholder: string;
  search_no_results: string;
  search_group_paths: string;
  search_group_tags: string;
  search_group_articles: string;
}

interface Props {
  data: SearchData;
  translations: Translations;
}

// --- Constants ---

const MAX_ARTICLES = 10;

// --- Component ---

export default function SearchDialog({ data, translations }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build Fuse instances once
  const fusePaths = useMemo(
    () => new Fuse(data.paths, { keys: ['title'], threshold: 0.4 }),
    [data.paths]
  );
  const fuseTags = useMemo(
    () => new Fuse(data.tags, { keys: ['name'], threshold: 0.4 }),
    [data.tags]
  );
  const fuseArticles = useMemo(
    () => new Fuse(data.articles, { keys: ['title', 'tags'], threshold: 0.4 }),
    [data.articles]
  );

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return { paths: [], tags: [], articles: [], flat: [] };

    const paths = fusePaths.search(query).map(r => r.item);
    const tags = fuseTags.search(query).map(r => r.item);
    const articles = fuseArticles.search(query).map(r => r.item).slice(0, MAX_ARTICLES);

    const flat: SearchItem[] = [
      ...paths,
      ...tags,
      ...articles,
    ];

    return { paths, tags, articles, flat };
  }, [query, fusePaths, fuseTags, fuseArticles]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-search-item]');
    items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    }
    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Navigate to selected item
  const navigateTo = useCallback((item: SearchItem) => {
    window.location.href = item.url;
  }, []);

  // Dialog keyboard navigation
  function handleDialogKey(e: React.KeyboardEvent) {
    const total = results.flat.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(total, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + Math.max(total, 1)) % Math.max(total, 1));
    } else if (e.key === 'Enter' && total > 0) {
      e.preventDefault();
      navigateTo(results.flat[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  // Render a result group
  function renderGroup(
    icon: string,
    label: string,
    items: SearchItem[],
    startIndex: number
  ) {
    if (items.length === 0) return null;
    return (
      <div>
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {icon} {label}
        </div>
        {items.map((item, i) => {
          const globalIndex = startIndex + i;
          const isSelected = globalIndex === selectedIndex;
          const title = item.type === 'tag' ? item.name : item.title;
          return (
            <a
              key={item.type === 'tag' ? item.name : item.type === 'path' ? item.id : item.slug}
              href={item.url}
              data-search-item
              className={`block px-3 py-2 text-sm cursor-pointer ${
                isSelected
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onMouseEnter={() => setSelectedIndex(globalIndex)}
              onClick={(e) => {
                e.preventDefault();
                navigateTo(item);
              }}
            >
              {title}
              {item.type === 'article' && item.tags.length > 0 && (
                <span className="ml-2 text-xs text-gray-400">
                  {item.tags.map(t => `#${t}`).join(' ')}
                </span>
              )}
            </a>
          );
        })}
      </div>
    );
  }

  if (!isOpen) return null;

  const hasResults = results.flat.length > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
      onClick={() => setIsOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-lg mx-4 bg-white rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleDialogKey}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-gray-200 px-3">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={translations.search_placeholder}
            className="w-full px-3 py-3 text-sm outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs text-gray-400 bg-gray-100 rounded border border-gray-200">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto">
          {hasQuery && !hasResults && (
            <div className="px-3 py-8 text-center text-sm text-gray-500">
              {translations.search_no_results}
            </div>
          )}

          {hasResults && (
            <>
              {renderGroup('📚', translations.search_group_paths, results.paths, 0)}
              {renderGroup('🏷️', translations.search_group_tags, results.tags, results.paths.length)}
              {renderGroup('📄', translations.search_group_articles, results.articles, results.paths.length + results.tags.length)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
