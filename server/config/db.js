const { Pool } = require('pg');

// Use Railway PostgreSQL connection string
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  get: (text, params) => pool.query(text, params).then(res => res.rows[0]),
  all: (text, params) => pool.query(text, params).then(res => res.rows),
  run: (text, params) => pool.query(text, params)
};
