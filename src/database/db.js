// Database connection layer - PostgreSQL only

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pgPool = null;

// Initialize database connection
export async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('[DATABASE] ERROR: DATABASE_URL environment variable is required');
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Use PostgreSQL
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false,
  });
  
  // Test connection
  try {
    const client = await pgPool.connect();
    console.log('[DATABASE] PostgreSQL connection established');
    client.release();
    
    // Initialize tables
    await initPostgreSQLTables();
  } catch (error) {
    console.error('[DATABASE] Failed to connect to PostgreSQL:', error);
    throw error;
  }
}

// Initialize PostgreSQL tables
async function initPostgreSQLTables() {
  const client = await pgPool.connect();
  try {
    // lesson_content table
    await client.query(`
      CREATE TABLE IF NOT EXISTS lesson_content (
        id SERIAL PRIMARY KEY,
        lesson_id INTEGER NOT NULL,
        content_type TEXT NOT NULL DEFAULT 'paragraph',
        content_order INTEGER NOT NULL DEFAULT 1,
        title TEXT,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // questions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        type TEXT,
        difficulty TEXT,
        location_tag TEXT,
        answers JSONB,
        correct_answer TEXT,
        module TEXT,
        source TEXT,
        comments TEXT
      )
    `);
    
    console.log('[DATABASE] PostgreSQL tables initialized');
  } finally {
    client.release();
  }
}

// Database query methods
export const dbQuery = {
  // Execute a SELECT query and return all results
  async all(query, params = []) {
    const client = await pgPool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  },
  
  // Execute a SELECT query and return first result
  async get(query, params = []) {
    const client = await pgPool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },
  
  // Execute an INSERT/UPDATE/DELETE query
  async run(query, params = []) {
    const client = await pgPool.connect();
    try {
      const result = await client.query(query, params);
      return { 
        lastInsertRowid: result.rows[0]?.id || null,
        changes: result.rowCount || 0
      };
    } finally {
      client.release();
    }
  },
  
  // Execute multiple queries in a transaction
  async exec(queries) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      for (const query of queries) {
        await client.query(query);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

// Convert query parameters from SQLite style (?) to PostgreSQL style ($1, $2, etc.)
export function convertQuery(query, params) {
  let paramIndex = 1;
  const convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
  return { query: convertedQuery, params };
}

// Get the database pool (for advanced usage)
export function getDatabase() {
  return { type: 'postgresql', pool: pgPool };
}

// Close database connections
export async function closeDatabase() {
  if (pgPool) {
    await pgPool.end();
    console.log('[DATABASE] PostgreSQL connection closed');
  }
}
