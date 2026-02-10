import { promises as fs } from 'fs';
import * as path from 'path';

const logsDir = path.resolve(process.cwd(), 'logs');

const ensureLogsDir = async () => {
  await fs.mkdir(logsDir, { recursive: true });
};

const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const formatTimestamp = (date: Date) => date.toISOString();

export const getLogFilePath = (type: string, date = new Date()) =>
  path.join(logsDir, `${type}-${formatDate(date)}.txt`);

export const logToFile = async (message: string, type = 'system') => {
  await ensureLogsDir();
  const timestamp = formatTimestamp(new Date());
  const line = `[${timestamp}] ${message}\n`;
  await fs.appendFile(getLogFilePath(type), line, 'utf8');
};

export const readLogs = async (type = 'system', date?: string) => {
  await ensureLogsDir();
  const targetDate = date ? new Date(date) : new Date();
  const filePath = getLogFilePath(type, targetDate);

  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return '';
  }
};
