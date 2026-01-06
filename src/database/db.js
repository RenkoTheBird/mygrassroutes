// Database connection layer - PostgreSQL only

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pgPool = null;

// Initialize database connection
export async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn('[DATABASE] WARNING: DATABASE_URL environment variable is not set');
    console.warn('[DATABASE] Database-dependent endpoints will not work until DATABASE_URL is configured');
    console.warn('[DATABASE] To fix: Add a PostgreSQL service in Railway and link it to your web service');
    pgPool = null;
    return false;
  }

  // Use PostgreSQL
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false,
    });
    
    // Test connection
    const client = await pgPool.connect();
    console.log('[DATABASE] PostgreSQL connection established');
    client.release();
    
    // Initialize tables
    await initPostgreSQLTables();
    return true;
  } catch (error) {
    console.error('[DATABASE] Failed to connect to PostgreSQL:', error);
    console.error('[DATABASE] Database-dependent endpoints will not work');
    pgPool = null;
    return false;
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

// Check if database is available
export function isDatabaseAvailable() {
  return pgPool !== null;
}

// Database query methods
export const dbQuery = {
  // Execute a SELECT query and return all results
  async all(query, params = []) {
    if (!pgPool) {
      throw new Error('Database is not available. Please configure DATABASE_URL environment variable.');
    }
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
    if (!pgPool) {
      throw new Error('Database is not available. Please configure DATABASE_URL environment variable.');
    }
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
    if (!pgPool) {
      throw new Error('Database is not available. Please configure DATABASE_URL environment variable.');
    }
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
    if (!pgPool) {
      throw new Error('Database is not available. Please configure DATABASE_URL environment variable.');
    }
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
