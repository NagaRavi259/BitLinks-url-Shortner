// lib/sqlite-adapter.js
// SQLite adapter — stores data in database/database.db

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "database");
const DB_PATH = path.join(DB_DIR, "database.db");

// Ensure the database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    // Enable WAL mode for better concurrent read performance
    db.pragma("journal_mode = WAL");
    // Create the links table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        shortUrl TEXT NOT NULL UNIQUE
      );
    `);
  }
  return db;
}

export async function findLink(shortUrl) {
  const database = getDb();
  const row = database.prepare("SELECT url, shortUrl FROM links WHERE shortUrl = ?").get(shortUrl);
  return row ? { url: row.url, shortUrl: row.shortUrl } : null;
}

export async function insertLink(url, shortUrl) {
  const database = getDb();
  database.prepare("INSERT INTO links (url, shortUrl) VALUES (?, ?)").run(url, shortUrl);
  return true;
}
