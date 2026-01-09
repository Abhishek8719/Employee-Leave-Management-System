import 'dotenv/config';

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import mysql from 'mysql2/promise';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const host = requireEnv('DB_HOST');
  const port = Number(process.env.DB_PORT || 3306);
  const user = requireEnv('DB_USER');
  const password = requireEnv('DB_PASSWORD');

  const schemaPath = path.join(__dirname, '..', 'database.sql');
  const sql = await fs.readFile(schemaPath, 'utf8');

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true
  });

  try {
    await conn.query(sql);
    // eslint-disable-next-line no-console
    console.log('Database initialized from database.sql');
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  
  console.error('Failed to initialize database:', err);
  process.exitCode = 1;
});
