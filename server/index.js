const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Basic Postgres connection – adjust if you use a different user/password
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'usman_portfolio',
  // user: process.env.PGUSER, // by default your macOS username
  // password: process.env.PGPASSWORD,
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function start() {
  await ensureTable();

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    try {
      await pool.query(
        'INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)',
        [name, email, message]
      );
      res.status(201).json({ success: true });
    } catch (err) {
      console.error('Error inserting contact message:', err);
      res.status(500).json({ error: 'Failed to save message.' });
    }
  });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Contact API listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

