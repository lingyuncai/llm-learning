export const translations = {
  zh: {
    // Navigation
    nav_home: '首页',
    nav_resources: '资源推荐',
    // BaseLayout
    site_description: 'LLM 技术知识库 — 深入理解 Transformer、Attention、KV Cache 等核心技术',
    ai_disclaimer: '本站内容由 AI 生成，可能存在错误。如发现问题，欢迎到',
    ai_disclaimer_link: 'GitHub Issues',
    ai_disclaimer_suffix: '反馈。',
    // Article
    updated_at: '更新于',
    learning_path_label: '学习路径',
    // Sidebar
    prerequisites: '前置知识',
    further_reading: '延伸阅读',
    toc: '目录',
    // Difficulty
    difficulty_beginner: '入门',
    difficulty_intermediate: '中级',
    difficulty_advanced: '高级',
    // Reference types
    ref_paper: '论文',
    ref_website: '网站',
    ref_video: '视频',
    ref_repo: '代码',
    ref_book: '书籍',
    ref_course: '课程',
    ref_blog: '博客',
    // Resource page types
    resource_website: '网站',
    resource_interactive: '交互式',
    resource_video: '视频',
    resource_paper: '论文',
    resource_repo: '代码仓库',
    // Resource page text
    resources_title: '外部学习资源',
    resources_description: '精选的 Transformer / LLM 学习资源，涵盖文章、交互式工具、视频和论文。',
    // Index page
    learning_paths: '学习路径',
    browse_by_tag: '按标签浏览',
    all_articles: '全部文章',
    articles_count: '篇文章',
    // Tag page
    tag_description_prefix: '标签',
    tag_description_suffix: '下的所有文章 — LLM Learning',
    // Coming Soon
    coming_soon_title: 'Coming Soon',
    coming_soon_body: '这篇文章的英文版本正在准备中。',
    coming_soon_link: '查看中文版 →',
  },
  en: {
    nav_home: 'Home',
    nav_resources: 'Resources',
    site_description: 'LLM Knowledge Base — Deep dive into Transformer, Attention, KV Cache and more',
    ai_disclaimer: 'Content on this site is AI-generated and may contain errors. If you find issues, please report at',
    ai_disclaimer_link: 'GitHub Issues',
    ai_disclaimer_suffix: '.',
    updated_at: 'Updated',
    learning_path_label: 'Learning Path',
    prerequisites: 'Prerequisites',
    further_reading: 'Further Reading',
    toc: 'Table of Contents',
    difficulty_beginner: 'Beginner',
    difficulty_intermediate: 'Intermediate',
    difficulty_advanced: 'Advanced',
    ref_paper: 'Paper',
    ref_website: 'Website',
    ref_video: 'Video',
    ref_repo: 'Code',
    ref_book: 'Book',
    ref_course: 'Course',
    ref_blog: 'Blog',
    resource_website: 'Website',
    resource_interactive: 'Interactive',
    resource_video: 'Video',
    resource_paper: 'Paper',
    resource_repo: 'Repository',
    resources_title: 'External Learning Resources',
    resources_description: 'Curated Transformer / LLM learning resources — articles, interactive tools, videos, and papers.',
    learning_paths: 'Learning Paths',
    browse_by_tag: 'Browse by Tag',
    all_articles: 'All Articles',
    articles_count: 'articles',
    tag_description_prefix: 'Tag',
    tag_description_suffix: '— LLM Learning',
    coming_soon_title: 'Coming Soon',
    coming_soon_body: 'The English version of this article is being prepared.',
    coming_soon_link: 'View Chinese version →',
  },
} as const;

export type Locale = 'zh' | 'en';
export type TranslationKey = keyof typeof translations.zh;
