import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_SITE_CONFIG, normalizeSiteConfig, type SiteConfig } from '@/lib/config/site-config';

export type { SiteConfig } from '@/lib/config/site-config';

export function getConfigFilePath(): string {
  return path.resolve(process.cwd(), 'config/site-config.json');
}

export function readSiteConfigFromDisk(): SiteConfig {
  try {
    const configPath = getConfigFilePath();
    if (!fs.existsSync(configPath)) {
      return DEFAULT_SITE_CONFIG;
    }
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    return normalizeSiteConfig(parsed);
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export function writeSiteConfig(config: SiteConfig): SiteConfig {
  try {
    const configPath = getConfigFilePath();
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    const normalized = normalizeSiteConfig(config);
    fs.writeFileSync(configPath, JSON.stringify(normalized, null, 2), 'utf8');
    return normalized;
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}
