import path from 'path';
import pino from 'pino';

export function getProjectRoot(): string {
  // In Netlify Functions, process.cwd() is the project root.
  // For local dev (e.g., `netlify dev`), it's also the project root.
  return process.cwd();
}

export function getDataDir(): string {
  // Correctly resolve the path to the data directory
  return path.join(getProjectRoot(), 'app', 'data');
}

export function getPromptsDir(): string {
  return path.join(getProjectRoot(), 'prompts');
}

// Basic logger setup
export const logger = pino({
  level: 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  // Mask sensitive data
  redact: {
    paths: ['email', 'phone', 'authorization', '*.headers.authorization'],
    censor: '[REDACTED]',
  },
});
