import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
const baseDir = isServerless ? '/tmp' : __dirname;

const config = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  selectedModel: process.env.DEFAULT_MODEL || 'gemini-3.7-flash',
  fallbackModel: process.env.FALLBACK_MODEL || 'gemini-2.5-flash',
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
  console.warn('Vault dir initialization notice:', e.message);
}

try {
  if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('Upload dir initialization notice:', e.message);
}

export function updateConfig(newConfig) {
  if (newConfig.geminiApiKey !== undefined) config.geminiApiKey = newConfig.geminiApiKey;
  if (newConfig.selectedModel !== undefined) config.selectedModel = newConfig.selectedModel;
  if (newConfig.provider !== undefined) config.provider = newConfig.provider;
}

export default config;
