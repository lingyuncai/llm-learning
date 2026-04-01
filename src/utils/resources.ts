import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export interface ExternalResource {
  id: string;
  title: string;
  author: string;
  url: string;
  type: 'website' | 'interactive' | 'video' | 'paper' | 'repo';
  tags: string[];
  description: string;
}

const RESOURCES_FILE = path.join(process.cwd(), 'src/content/resources/external-resources.yaml');

export function getAllResources(): ExternalResource[] {
  const content = fs.readFileSync(RESOURCES_FILE, 'utf-8');
  return yaml.load(content) as ExternalResource[];
}

export function getResourcesByTag(tag: string): ExternalResource[] {
  return getAllResources().filter(r => r.tags.includes(tag));
}
