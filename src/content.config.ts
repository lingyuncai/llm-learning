import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: './src/content/articles',
    generateId: ({ data }) => `${data.locale || 'zh'}/${data.slug}`,
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    locale: z.enum(['zh', 'en']).default('zh'),
    tags: z.array(z.string()),
    prerequisites: z.array(z.string()).optional().default([]),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    created: z.string(),
    updated: z.string(),
    references: z.array(z.object({
      type: z.enum(['paper', 'website', 'video', 'repo', 'book', 'course', 'blog']),
      title: z.string(),
      url: z.string().url(),
    })).min(1),
  }),
});

export const collections = { articles };
