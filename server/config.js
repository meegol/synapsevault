import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
const baseDir = isServerless ? '/tmp' : __dirname;

const primaryKey = process.env.GEMINI_API_KEY || '';
const backupKey = process.env.GEMINI_BACKUP_KEY || process.env.GEMINI_API_KEY_FALLBACK || '';

// Pool of available keys for automatic quota failover
const rawKeys = [primaryKey, backupKey].filter(Boolean);
const apiKeys = Array.from(new Set(rawKeys));

const config = {
  geminiApiKey: primaryKey,
  backupApiKey: backupKey,
  apiKeys: apiKeys.length > 0 ? apiKeys : [''],
  selectedModel: process.env.DEFAULT_MODEL || 'gemini-2.5-flash',
  fallbackModel: process.env.FALLBACK_MODEL || 'gemini-2.0-flash',
  port: parseInt(process.env.PORT || '3001', 10),
  vaultDir: path.resolve(baseDir, 'vault'),
  uploadDir: path.resolve(baseDir, 'uploads'),
  provider: 'gemini',
  isServerless
};

try {
  if (!fs.existsSync(config.vaultDir)) {
    fs.mkdirSync(config.vaultDir, { recursive: true });
  }
} catch (e) {
  // Safe in serverless
}

try {
  if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
  }
} catch (e) {
  // Safe in serverless
}

export function updateConfig(newConfig) {
  if (newConfig.geminiApiKey !== undefined) {
    config.geminiApiKey = newConfig.geminiApiKey;
    config.apiKeys = [newConfig.geminiApiKey, config.backupApiKey].filter(Boolean);
  }
  if (newConfig.selectedModel !== undefined) config.selectedModel = newConfig.selectedModel;
  if (newConfig.provider !== undefined) config.provider = newConfig.provider;
}

export default config;
