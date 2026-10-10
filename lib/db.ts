import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'promptstudio.db');

let db: sqlite3.Database | null = null;

export function getDatabase(): sqlite3.Database {
  if (!db) {
    db = new sqlite3.Database(dbPath);
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  const database = db!;

  database.serialize(() => {
    // Users table
    database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Teams table
    database.run(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        ownerId TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY(ownerId) REFERENCES users(id)
      )
    `);

    // Team members table
    database.run(`
      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        teamId TEXT NOT NULL,
        userId TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        joinedAt TEXT NOT NULL,
        FOREIGN KEY(teamId) REFERENCES teams(id),
        FOREIGN KEY(userId) REFERENCES users(id),
        UNIQUE(teamId, userId)
      )
    `);

    // Prompts table
    database.run(`
      CREATE TABLE IF NOT EXISTS prompts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT,
        tags TEXT,
        isPublic BOOLEAN DEFAULT 0,
        userId TEXT NOT NULL,
        teamId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        views INTEGER DEFAULT 0,
        uses INTEGER DEFAULT 0,
        rating REAL DEFAULT 0,
        FOREIGN KEY(userId) REFERENCES users(id),
        FOREIGN KEY(teamId) REFERENCES teams(id)
      )
    `);

    // Analytics table
    database.run(`
      CREATE TABLE IF NOT EXISTS analytics (
        id TEXT PRIMARY KEY,
        promptId TEXT NOT NULL,
        userId TEXT,
        action TEXT,
        timestamp TEXT NOT NULL,
        metadata TEXT,
        FOREIGN KEY(promptId) REFERENCES prompts(id),
        FOREIGN KEY(userId) REFERENCES users(id)
      )
    `);

    // Prompt ratings table
    database.run(`
      CREATE TABLE IF NOT EXISTS prompt_ratings (
        id TEXT PRIMARY KEY,
        promptId TEXT NOT NULL,
        userId TEXT NOT NULL,
        rating INTEGER,
        feedback TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(promptId) REFERENCES prompts(id),
        FOREIGN KEY(userId) REFERENCES users(id),
        UNIQUE(promptId, userId)
      )
    `);
  });
}

export async function queryAsync<T>(query: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    getDatabase().all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

export async function getAsync<T>(query: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    getDatabase().get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

export async function runAsync(query: string, params: any[] = []): Promise<{ id: string; changes: number }> {
  return new Promise((resolve, reject) => {
    getDatabase().run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID?.toString() || '', changes: this.changes });
    });
  });
}
