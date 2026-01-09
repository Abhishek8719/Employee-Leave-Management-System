import { pool } from './db.js';

export async function createLeave({ userId, startDate, endDate, reason }) {
  const [result] = await pool.execute(
    'INSERT INTO leaves (user_id, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?) ',
    [userId, startDate, endDate, reason, 'Pending']
  );
  return result.insertId;
}

export async function listByUser(userId) {
  const [rows] = await pool.execute(
    'SELECT id, start_date, end_date, reason, status, created_at FROM leaves WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

export async function listAll() {
  const [rows] = await pool.execute(
    `SELECT l.id, u.name, u.email, l.start_date, l.end_date, l.reason, l.status, l.created_at
     FROM leaves l
     JOIN users u ON u.id = l.user_id
     ORDER BY l.created_at DESC`
  );
  return rows;
}

export async function findWithUserById(id) {
  const [rows] = await pool.execute(
    `SELECT l.id, l.user_id, u.name, u.email, l.start_date, l.end_date, l.reason, l.status, l.created_at, l.updated_at
     FROM leaves l
     JOIN users u ON u.id = l.user_id
     WHERE l.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function updateStatus(id, status) {
  const [result] = await pool.execute('UPDATE leaves SET status = ? WHERE id = ?', [status, id]);
  return result.affectedRows;
}

export async function findByIdForUser(id, userId) {
  const [rows] = await pool.execute(
    'SELECT id, user_id, start_date, end_date, reason, status, created_at, updated_at FROM leaves WHERE id = ? AND user_id = ? LIMIT 1',
    [id, userId]
  );
  return rows[0] || null;
}

export async function updateLeaveForUser(id, userId, { startDate, endDate, reason }) {
  const [result] = await pool.execute(
    "UPDATE leaves SET start_date = ?, end_date = ?, reason = ? WHERE id = ? AND user_id = ? AND status = 'Pending'",
    [startDate, endDate, reason, id, userId]
  );
  return result.affectedRows;
}

export async function deleteLeaveForUser(id, userId) {
  const [result] = await pool.execute("DELETE FROM leaves WHERE id = ? AND user_id = ? AND status = 'Pending'", [id, userId]);
  return result.affectedRows;
}
