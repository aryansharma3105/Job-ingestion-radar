import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { config } from '../config.js';
import { CREATE_TABLES_SQL } from './schema.js';

let dbInstance = null;

export function getDatabase(dbPath = config.databasePath) {
  if (dbInstance) {
    return dbInstance;
  }

  // Ensure directory exists if dbPath has folder components
  const dir = path.dirname(dbPath);
  if (dir && dir !== '.' && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  dbInstance = new DatabaseSync(dbPath);
  dbInstance.exec(CREATE_TABLES_SQL);

  return dbInstance;
}

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
