import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export async function initDB() {
  if (!db) {
    db = await open({
      filename: './appointments.db',
      driver: sqlite3.Database
    });

    // Create tables if not exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        service TEXT,
        date TEXT,
        time TEXT
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointmentId INTEGER,
        action TEXT,
        timestamp TEXT
      );
    `);
  }
}

export function getDB() {
  return db;
}

export async function insertAppointment(name, email, service, date, time) {
  const db = getDB();
  const result = await db.run(
    `INSERT INTO appointments (name, email, service, date, time) VALUES (?, ?, ?, ?, ?)`,
    [name, email, service, date, time]
  );

  return result.lastID; // 🔁 Make sure this line exists
}

export async function getAppointments() {
  await initDB();
  return await db.all(`SELECT * FROM appointments`);
}

export async function isSlotTaken(service, date, time) {
  await initDB();
  const row = await db.get(
    `SELECT * FROM appointments WHERE service = ? AND date = ? AND time = ?`,
    [service, date, time]
  );
  return !!row;
}


export async function updateAppointment(id, name, service, date, time) {
  await initDB();
  await db.run(
    `UPDATE appointments SET name = ?, service = ?, date = ?, time = ? WHERE id = ?`,
    [name, service, date, time, id]
  );
}

export async function deleteAppointment(id) {
  await initDB();
  await db.run(`DELETE FROM appointments WHERE id = ?`, [id]);
}

export async function logAction(action, appointmentId) {
  await initDB();
  await db.run(
    `INSERT INTO logs (appointmentId, action, timestamp) VALUES (?, ?, ?)`,
    [appointmentId, action, new Date().toISOString()]
  );
}


