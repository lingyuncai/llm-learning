import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export interface LearningPath {
  id: string;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  level: 'beginner' | 'intermediate' | 'advanced';
  articles: string[];
}

const PATHS_DIR = path.join(process.cwd(), 'src/content/paths');

export function getAllPaths(): LearningPath[] {
  const pathsDir = PATHS_DIR;
  const files = fs.readdirSync(pathsDir).filter(f => f.endsWith('.yaml'));
  return files.map(file => {
    const content = fs.readFileSync(path.join(pathsDir, file), 'utf-8');
    return yaml.load(content) as LearningPath;
  });
}

export function getPathById(id: string): LearningPath | undefined {
  return getAllPaths().find(p => p.id === id);
}
