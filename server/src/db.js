import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'database.sqlite');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Schema
export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      address TEXT PRIMARY KEY,
      username TEXT,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT NOT NULL,
      content TEXT,
      ipfs_cid TEXT,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER,
      user TEXT,
      type TEXT CHECK(type IN ('like','comment','share','follow')),
      comment_text TEXT,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT,
      tx_hash TEXT,
      block_number INTEGER,
      data TEXT,
      created_at INTEGER DEFAULT (strftime('%s','now')),
      UNIQUE(tx_hash, event_name)
    );
  `);
}

// Initialize schema on module load to ensure prepared statements work
initSchema();

// Users
export const upsertUser = db.prepare(`INSERT INTO users(address, username) VALUES(?, ?) ON CONFLICT(address) DO UPDATE SET username=excluded.username`);
export const getUser = db.prepare(`SELECT * FROM users WHERE address = ?`);

// Posts
export const insertPost = db.prepare(`INSERT INTO posts(author, content, ipfs_cid) VALUES(?, ?, ?)`);
export const updatePost = db.prepare(`UPDATE posts SET content = ?, ipfs_cid = ? WHERE id = ?`);
export const deletePost = db.prepare(`DELETE FROM posts WHERE id = ?`);
export const getPostById = db.prepare(`SELECT * FROM posts WHERE id = ?`);
export const listPosts = db.prepare(`SELECT * FROM posts ORDER BY id DESC LIMIT ? OFFSET ?`);

// Interactions
export const insertInteraction = db.prepare(`INSERT INTO interactions(post_id, user, type, comment_text) VALUES(?, ?, ?, ?)`);
export const listInteractionsByPost = db.prepare(`SELECT * FROM interactions WHERE post_id = ? ORDER BY id DESC`);

// Events
export const insertEvent = db.prepare(`INSERT OR IGNORE INTO events(event_name, tx_hash, block_number, data) VALUES(?, ?, ?, ?)`);
export const listEvents = db.prepare(`SELECT * FROM events ORDER BY id DESC LIMIT ? OFFSET ?`);
