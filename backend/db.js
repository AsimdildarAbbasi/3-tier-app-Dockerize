const { Pool } = require('pg');
require('dotenv').config();

// Create a new connection pool using environment variables or a direct connection string
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  // Option 1: Using separate connection components
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,

  // Option 2: Using a direct connection string (e.g. postgres://...)
  connectionString: process.env.DATABASE_URL,

  // Enable SSL config if needed (useful for cloud databases like Supabase, Render, AWS RDS)
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false
});

// Log connection status when a client is created
pool.on('connect', () => {
  console.log('Database client connected!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// Test connection and initialize tables immediately on startup
const initDb = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connection verified successfully!');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createTableQuery);
    console.log('Database table "todos" is ready.');
  } catch (err) {
    console.error('Database connection/initialization failed:', err.message);
  }
};

initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
