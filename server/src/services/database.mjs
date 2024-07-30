import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('../db/database.db', (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Database connected.');
  }
});

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender_username TEXT, sender_id INTEGER, recipient_id INTEGER, client_offset TEXT UNIQUE, content TEXT, room TEXT, event_time TEXT, event_time_seconds TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, hashed_password TEXT)');
});

export { db };
