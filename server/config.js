import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const config = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  selectedModel: process.env.DEFAULT_MODEL || 'gemini-3.7-flash',
  fallbackModel: process.env.FALLBACK_MODEL || 'gemini-2.5-flash',
  port: parseInt(process.env.PORT || '3001', 10),
  vaultDir: path.resolve(__dirname, process.env.VAULT_DIR || './vault'),
  uploadDir: path.resolve(__dirname, process.env.UPLOAD_DIR || './uploads'),
  provider: 'gemini'
};

if (!fs.existsSync(config.vaultDir)) {
  fs.mkdirSync(config.vaultDir, { recursive: true });
}
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

export function updateConfig(newConfig) {
  if (newConfig.geminiApiKey !== undefined) config.geminiApiKey = newConfig.geminiApiKey;
  if (newConfig.selectedModel !== undefined) config.selectedModel = newConfig.selectedModel;
  if (newConfig.provider !== undefined) config.provider = newConfig.provider;
}

export default config;
