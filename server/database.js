import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database file in server directory
const db = new Database(path.join(__dirname, 'stocks.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6366f1',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    note TEXT DEFAULT '',
    group_id INTEGER REFERENCES groups(id),
    is_archived INTEGER DEFAULT 0,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert default groups if they don't exist
const defaultGroups = [
  { name: 'Watchlist', color: '#6366f1' },
  { name: 'Swing Trade', color: '#22c55e' },
  { name: 'Long Holding', color: '#3b82f6' },
  { name: 'Short Term', color: '#f59e0b' },
  { name: 'High Risk', color: '#ef4444' }
];

const insertGroup = db.prepare('INSERT OR IGNORE INTO groups (name, color) VALUES (?, ?)');
defaultGroups.forEach(g => insertGroup.run(g.name, g.color));

export default db;
