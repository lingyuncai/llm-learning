import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';

const ARTICLES_DIR = 'src/content/articles';
const PATHS_DIR = 'src/content/paths';

interface ValidationError {
  file: string;
  field: string;
  message: string;
}

const errors: ValidationError[] = [];
const warnings: string[] = [];

const articleSlugs = new Set<string>();
const allTags = new Map<string, string[]>();

function validateArticles() {
  const zhDir = path.join(ARTICLES_DIR, 'zh');
  if (!fs.existsSync(zhDir)) return;

  const files = fs.readdirSync(zhDir).filter(f => f.endsWith('.mdx'));

  for (const file of files) {
    const filePath = path.join(zhDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);

    const requiredFields = ['title', 'slug', 'tags', 'difficulty', 'created', 'updated', 'references'];

    for (const field of requiredFields) {
      if (!data[field]) {
        errors.push({ file: filePath, field, message: `Missing required field: ${field}` });
      }
    }

    if (data.slug) {
      if (articleSlugs.has(data.slug)) {
        errors.push({ file: filePath, field: 'slug', message: `Duplicate slug: ${data.slug}` });
      }
      articleSlugs.add(data.slug);
    }

    if (data.difficulty && !['beginner', 'intermediate', 'advanced'].includes(data.difficulty)) {
      errors.push({ file: filePath, field: 'difficulty', message: `Invalid difficulty: ${data.difficulty}` });
    }

    if (data.references && Array.isArray(data.references)) {
      if (data.references.length === 0) {
        errors.push({ file: filePath, field: 'references', message: 'references must have at least one entry' });
      }
      for (const ref of data.references) {
        if (!ref.url || !ref.title || !ref.type) {
          errors.push({ file: filePath, field: 'references', message: 'Each reference must have type, title, and url' });
        }
        if (ref.url && !/^https?:\/\//.test(ref.url)) {
          errors.push({ file: filePath, field: 'references', message: `Invalid URL: ${ref.url}` });
        }
      }
    } else if (data.references !== undefined) {
      errors.push({ file: filePath, field: 'references', message: 'references must be an array with at least one entry' });
    }

    if (data.tags && Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        if (!allTags.has(tag)) allTags.set(tag, []);
        allTags.get(tag)!.push(filePath);
      }
    }
  }

  // Second pass: check prerequisites
  for (const file of files) {
    const filePath = path.join(zhDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(content);

    if (data.prerequisites && Array.isArray(data.prerequisites)) {
      for (const prereq of data.prerequisites) {
        if (!articleSlugs.has(prereq)) {
          errors.push({ file: filePath, field: 'prerequisites', message: `Referenced slug not found: ${prereq}` });
        }
      }
    }
  }
}

function validatePaths() {
  if (!fs.existsSync(PATHS_DIR)) return;

  const files = fs.readdirSync(PATHS_DIR).filter(f => f.endsWith('.yaml'));

  for (const file of files) {
    const filePath = path.join(PATHS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = yaml.load(content) as any;

    if (!data.id || !data.title || !data.articles) {
      errors.push({ file: filePath, field: 'structure', message: 'Path must have id, title, and articles' });
      continue;
    }

    for (const slug of data.articles) {
      if (!articleSlugs.has(slug)) {
        warnings.push(`[${filePath}] Path references article slug "${slug}" which does not exist yet`);
      }
    }
  }
}

// Run
console.log('Validating content...\n');
validateArticles();
validatePaths();

if (warnings.length > 0) {
  console.log('⚠️  Warnings:');
  for (const w of warnings) console.log(`   ${w}`);
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ Errors:');
  for (const e of errors) {
    console.log(`   [${e.file}] ${e.field}: ${e.message}`);
  }
  console.log(`\n${errors.length} error(s) found.`);
  process.exit(1);
} else {
  console.log('✅ All content validation passed.');
}
